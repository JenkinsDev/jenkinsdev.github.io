#!/usr/bin/env python
# -*- coding: utf-8 -*- #
from __future__ import unicode_literals

AUTHOR = 'David Jenkins'
SITENAME = 'JenkinsDev'
SITEURL = 'http://localhost:8000'
SITEURL_ABSOLUTE = SITEURL

PATH = 'content'

TIMEZONE = 'America/New_York'

DEFAULT_LANG = 'en'

# Feed generation is usually not desired when developing
FEED_ALL_ATOM = None
CATEGORY_FEED_ATOM = None
TRANSLATION_FEED_ATOM = None
AUTHOR_FEED_ATOM = None
AUTHOR_FEED_RSS = None

# Blogroll
LINKS = ()

# Social widget
SOCIAL = ()

SITEMAP = {'format': 'xml'}

DEFAULT_PAGINATION = 10
THEME = 'themes/djenkinsdev_theme'
PLUGIN_PATHS = ['pelican-plugins']
PLUGINS = ['readtime', 'sitemap']
