#!/usr/bin/env python
# -*- coding: utf-8 -*- #
from __future__ import unicode_literals


import os
import sys
sys.path.append(os.curdir)
from pelicanconf import *

SITEURL = 'http://jenkinsdev.github.io'
RELATIVE_URLS = False

FEED_ALL_ATOM = 'feeds/all.atom.xml'
CATEGORY_FEED_ATOM = 'feeds/{slug}.atom.xml'

DELETE_OUTPUT_DIRECTORY = True

AUTHOR = 'David Jenkins'
SITENAME = 'DJenkinsDev'

PATH = 'content'

TIMEZONE = 'America/New_York'

DEFAULT_LANG = 'en'

LOAD_CONTENT_CACHE = False

DEFAULT_PAGINATION = False

THEME = 'themes/djenkinsdev_theme'

PLUGINS = [readtime]
