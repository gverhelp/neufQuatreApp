from django.contrib import admin
from .models import Section, SectionImage, Chef
from django.core.exceptions import ValidationError
from django.contrib import messages

# Register your models here.
class SectionImageInline(admin.TabularInline):
    model = SectionImage
    extra = 1
    
class SectionAdmin(admin.ModelAdmin):
    inlines = [SectionImageInline]
    list_display = ['name', 'bankAccount', 'email']
    search_fields = ['name', 'email']
    readonly_fields = ("slug", 'name')

    def has_add_permission(self, request):
        if Section.objects.count() < 9:
            return True
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False

    def delete_model(self, request, obj):
        try:
            obj.delete()
        except ValidationError as e:
            self.message_user(request, str(e), level=messages.ERROR)
    
class ChefAdmin(admin.ModelAdmin):
    list_display = ['name', 'totem', 'phoneNumber', 'section', 'chefResp']
    search_fields = ['name', 'totem', 'section__name', 'chefResp']
    ordering = ['section']
    list_filter = ['section', 'chefResp']

admin.site.register(Section, SectionAdmin)
admin.site.register(Chef, ChefAdmin)