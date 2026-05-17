import re
from .models import Notification
from django.contrib.auth import get_user_model

User = get_user_model()


def get_project_members(task):
    """
    Task-тай холбоотой Project-ийн бүх гишүүдийг буцаана.
    Project.user (эзэмшигч) + Project.members (гишүүд)
    """
    project = task.project
    member_ids = set()

    if project.user_id:
        member_ids.add(project.user_id)

    member_ids.update(
        project.members.values_list('id', flat=True)
    )

    return User.objects.filter(id__in=member_ids)


def process_mentions(comment):
    """
    Comment-ийн текст дотроос @username хайж, зөвхөн тухайн
    project-ийн гишүүдэд mention мэдэгдэл илгээнэ.
    """
    mentions = re.findall(r'@(\w+)', comment.content or '')
    if not mentions:
        return

    project_members = get_project_members(comment.task)
    member_map = {u.username: u for u in project_members}

    for username in set(mentions):          # set → давтагдах mention-г нэг удаа
        target_user = member_map.get(username)
        if not target_user:
            continue                         # Project-ийн гишүүн биш → алгас
        if target_user == comment.user:
            continue                         # Өөрийгөө дурдсан → алгас

        Notification.objects.get_or_create(
            recipient=target_user,
            sender=comment.user,
            notification_type='mention',
            comment=comment,
            defaults={
                'task': comment.task,
                'message': (
                    f"📌 {comment.user.get_full_name() or comment.user.username} "
                    f"таныг «{comment.task.title}» таск дээр дурдлаа."
                ),
            },
        )


def notify_task_assigned(task, assigned_to, assigned_by):
    """Таск шинээр хариуцуулах үед мэдэгдэл илгээх."""
    if assigned_to == assigned_by:
        return

    Notification.objects.create(
        recipient=assigned_to,
        sender=assigned_by,
        notification_type='task_assign',
        task=task,
        message=(
            f"📋 {assigned_by.get_full_name() or assigned_by.username} "
            f"таны хариуцлагад «{task.title}» таскийг нэмлээ."
        ),
    )


def notify_new_comment(comment):
    """
    Таск дээр шинэ comment ирэх үед таскийн эзэн болон
    оролцогчдод (comment хийгчээс бусад) мэдэгдэл илгээнэ.
    """
    task = comment.task
    commenter = comment.user

    # Мэдэгдэл хүлээн авах хүмүүс:
    # 1) Таскийн assigned_to хэрэв байвал
    # 2) Project эзэн + гишүүд (энгийнээр project_members)
    project_members = get_project_members(task)
    recipients = set(project_members.values_list('id', flat=True))

    if hasattr(task, 'assigned_to') and task.assigned_to_id:
        recipients.add(task.assigned_to_id)

    recipients.discard(commenter.id)        # Өөрт мэдэгдэл очихгүй

    notifications = [
        Notification(
            recipient_id=uid,
            sender=commenter,
            notification_type='comment',
            task=task,
            comment=comment,
            message=(
                f"💬 {commenter.get_full_name() or commenter.username} "
                f"«{task.title}» таск дээр сэтгэгдэл үлдээлээ."
            ),
        )
        for uid in recipients
    ]
    Notification.objects.bulk_create(notifications, ignore_conflicts=True)


def notify_status_change(task, changed_by, old_status, new_status):
    """Таскийн статус өөрчлөгдөх үед мэдэгдэл илгээх."""
    project_members = get_project_members(task)
    recipients = project_members.exclude(id=changed_by.id)

    STATUS_LABELS = {
        'todo': 'Хийгдэх',
        'in_progress': 'Хийгдэж байна',
        'done': 'Дууссан',
        'cancelled': 'Цуцлагдсан',
    }

    notifications = [
        Notification(
            recipient=user,
            sender=changed_by,
            notification_type='status_change',
            task=task,
            message=(
                f"🔄 «{task.title}» таскийн статус "
                f"{STATUS_LABELS.get(old_status, old_status)} → "
                f"{STATUS_LABELS.get(new_status, new_status)} болж өөрчлөгдлөө."
            ),
        )
        for user in recipients
    ]
    Notification.objects.bulk_create(notifications, ignore_conflicts=True)