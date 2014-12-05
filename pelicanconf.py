#!/usr/bin/env python
# -*- coding: utf-8 -*- #
from __future__ import unicode_literals
import readtime


AUTHOR = 'David Jenkins'
SITENAME = 'DJenkins Dev'
SITEURL = 'http://localhost:8000/'

PATH = 'content'

TIMEZONE = 'America/New_York'

DEFAULT_LANG = 'en'

# Feed generation is usually not desired when developing
FEED_ALL_ATOM = None
CATEGORY_FEED_ATOM = None
TRANSLATION_FEED_ATOM = None
AUTHOR_FEED_ATOM = None
AUTHOR_FEED_RSS = None

LOAD_CONTENT_CACHE = False

# Blogroll
LINKS = (('Pelican', 'http://getpelican.com/'),
         ('Python.org', 'http://python.org/'),
         ('Jinja2', 'http://jinja.pocoo.org/'),
         ('You can modify those links in your config file', '#'),)

# Social widget
SOCIAL = (('You can add links in your config file', '#'),
          ('Another social link', '#'),)

DEFAULT_PAGINATION = False

THEME = 'themes/djenkinsdev_theme'

PLUGINS = [readtime]

# Uncomment following line if you want document-relative URLs when developing
#RELATIVE_URLS = True
