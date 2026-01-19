# Django imports
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid

# Module imports
from plane.ee.utils import move_project_activities_from_workspace_activities
from plane.ee.utils import move_project_member_activities_from_workspace_activities

def move_project_and_project_member_activities(apps, schema_editor):
    move_project_activities_from_workspace_activities(apps)
    move_project_member_activities_from_workspace_activities(apps)



class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('db', '0112_auto_20251124_0603'),
        ('ee', '0058_projecttemplate_is_milestone_enabled'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='ProjectMemberActivityModel',
            new_name='ProjectMemberActivity',
        ),
        migrations.AlterField(
            model_name='workspacememberactivity',
            name='type',
            field=models.CharField(max_length=255),
        ),
        migrations.CreateModel(
            name='ProjectActivity',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created At')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Last Modified At')),
                ('deleted_at', models.DateTimeField(blank=True, null=True, verbose_name='Deleted At')),
                ('id', models.UUIDField(db_index=True, default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True)),
                ('verb', models.CharField(default='created', max_length=255, verbose_name='Action')),
                ('field', models.CharField(blank=True, max_length=255, null=True, verbose_name='Field Name')),
                ('old_value', models.TextField(blank=True, null=True, verbose_name='Old Value')),
                ('new_value', models.TextField(blank=True, null=True, verbose_name='New Value')),
                ('comment', models.TextField(blank=True, verbose_name='Comment')),
                ('old_identifier', models.UUIDField(null=True)),
                ('new_identifier', models.UUIDField(null=True)),
                ('epoch', models.FloatField(null=True)),
                ('actor', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='project_activities', to=settings.AUTH_USER_MODEL)),
                ('created_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='%(class)s_created_by', to=settings.AUTH_USER_MODEL, verbose_name='Created By')),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='project_%(class)s', to='db.project')),
                ('updated_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='%(class)s_updated_by', to=settings.AUTH_USER_MODEL, verbose_name='Last Modified By')),
                ('workspace', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='workspace_%(class)s', to='db.workspace')),
            ],
            options={
                'verbose_name': 'Project Activity',
                'verbose_name_plural': 'Project Activities',
                'db_table': 'project_activities',
                'ordering': ('-created_at',),
            },
        ), 
        migrations.AddField(
            model_name='projectmemberactivity',
            name='new_identifier',
            field=models.UUIDField(null=True),
        ),
        migrations.AddField(
            model_name='projectmemberactivity',
            name='old_identifier',
            field=models.UUIDField(null=True),
        ),
        migrations.AlterField(
            model_name='projectmemberactivity',
            name='type',
            field=models.CharField(max_length=25),
        ),
        migrations.RunPython(move_project_and_project_member_activities, reverse_code=migrations.RunPython.noop),
    ]
