from django.conf.urls.defaults import *
from django.template.defaultfilters import slugify
from django.utils.translation import ugettext as _
from django.conf import settings

from ella.core.views import object_detail, list_content_type, category_detail, home

try:
    if settings.CUSTOM_VIEWS:
        views = settings.VIEWS
        temp = __import__(views, globals(), locals(), ['object_detail', 'list_content_type', 'category_detail', 'home'])
        object_detail = temp.object_detail
        list_content_type = temp.list_content_type
        category_detail = temp.category_detail
        home = temp.home
except:
    pass

from ella.core.feeds import RSSTopCategoryListings, AtomTopCategoryListings


feeds = {
    'rss' : RSSTopCategoryListings,
    'atom' : AtomTopCategoryListings,
}

res = {
    'ct': r'(?P<content_type>[a-z][a-z0-9-]+)',
    'cat': r'(?P<category>[a-z][a-z0-9-/]+)',
    'slug': r'(?P<slug>[a-z0-9-]+)',
    'year': r'(?P<year>\d{4})',
    'month': r'(?P<month>\d{1,2})',
    'day': r'(?P<day>\d{1,2})',
    'rest': r'(?P<url_remainder>.+/)',
    'id': r'(?P<id>\d+)',
}

urlpatterns = patterns( '',
    # home page
    url( r'^$', home, name="root_homepage" ),

    # export banners
    url( r'^export/xml/(?P<name>[a-z0-9-]+)/$', 'ella.core.views.export', { 'count' : 3, 'content_type' : 'text/xml' }, name="named_export_xml" ),
    url( r'^export/$', 'ella.core.views.export', { 'count' : 3 }, name="export" ),
    url( r'^export/(?P<name>[a-z0-9-]+)/$', 'ella.core.views.export', { 'count' : 3 }, name="named_export" ),

    # rss feeds
    url( r'^feeds/(?P<url>.*)/$', 'django.contrib.syndication.views.feed', { 'feed_dict': feeds }, name="feeds" ),

    # list of objects regadless of category and content type
    url( r'^%(year)s/%(month)s/%(day)s/$' % res, list_content_type, name="list_day" ),
    url( r'^%(year)s/%(month)s/$' % res, list_content_type, name="list_month" ),
    url( r'^%(year)s/$' % res, list_content_type, name="list_year" ),

    # list of objects regardless of category
    url( r'^%(year)s/%(month)s/%(day)s/%(ct)s/$' % res, list_content_type, name="list_content_type_day" ),
    url( r'^%(year)s/%(month)s/%(ct)s/$' % res, list_content_type, name="list_content_type_month" ),
    url( r'^%(year)s/%(ct)s/$' % res, list_content_type, name="list_content_type_year" ),

    # static detail with custom action
    url( r'^%(cat)s/%(ct)s/%(id)s-%(slug)s/%(rest)s$' % res, object_detail, name='static_detail_action' ),
    url( r'^%(ct)s/%(id)s-%(slug)s/%(rest)s$' % res, object_detail, { 'category' : '' }, name='home_static_detail_action' ),

    # static detail
    url( r'^%(cat)s/%(ct)s/%(id)s-%(slug)s/$' % res, object_detail, name='static_detail' ),
    url( r'^%(ct)s/%(id)s-%(slug)s/$' % res, object_detail, { 'category' : '' }, name='home_static_detail' ),

    # object detail
    url( r'^%(cat)s/%(year)s/%(month)s/%(day)s/%(ct)s/%(slug)s/$' % res, object_detail, name="object_detail" ),
    url( r'^%(year)s/%(month)s/%(day)s/%(ct)s/%(slug)s/$' % res, object_detail, { 'category' : '' }, name="home_object_detail" ),

    # object detail with custom action
    url( r'^%(cat)s/%(year)s/%(month)s/%(day)s/%(ct)s/%(slug)s/%(rest)s$' % res, object_detail, name="object_detail_action" ),
    url( r'^%(year)s/%(month)s/%(day)s/%(ct)s/%(slug)s/%(rest)s$' % res, object_detail, { 'category' : '' }, name="home_object_detail_action" ),

    # category listings
    url( r'^%(cat)s/%(year)s/%(month)s/%(day)s/$' % res, list_content_type, name="category_list_day" ),
    url( r'^%(cat)s/%(year)s/%(month)s/$' % res, list_content_type, name="category_list_month" ),
    url( r'^%(cat)s/%(year)s/$' % res, list_content_type, name="category_list_year" ),

    # category listings for content_type
    url( r'^%(cat)s/%(year)s/%(month)s/%(day)s/%(ct)s/$' % res, list_content_type, name="category_list_content_type_day" ),
    url( r'^%(cat)s/%(year)s/%(month)s/%(ct)s/$' % res, list_content_type, name="category_list_content_type_month" ),
    url( r'^%(cat)s/%(year)s/%(ct)s/$' % res, list_content_type, name="category_list_content_type_year" ),

    # category homepage
    url( r'^%(cat)s/$' % res, category_detail, name="category_detail" ),

)
