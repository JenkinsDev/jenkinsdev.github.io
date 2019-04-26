Title: Hello, World!
Date: 2019-04-26
Category: General
Tags: greeting, python, javascript
Slug: hello-world
Authors: David Jenkins
DisqusIdentifier: hello-world
Summary: This isn't your normal 'Hello, World' introduction, this is my personal
         introduction to you.  Find out who I am, what I do
         and what this _blog_ is going to be all about.


##### Come One, Come All

I'd like to welcome you, the reader, to my blog.  This
is going to be the breeding ground for content ranging from
entry-level programming concepts to more complex topics.  Obviously, this blog won't
just be about programming though, its going to be the home to a lot of my thoughts in general.


##### A Bit About Me

My name is David Jenkins and I currently work over at [Bold Media Group](https://boldmediagroup.com).
I create some pretty awesome things there that revolve around
automation.  AUTOMATE EVERYTHING.  That's right, I am
a *HUGE* automation advocate, if it's a task that could be automated in some
form, then it should automated.  Isn't that what a lot of technology is for anyway?

Enough about that automation jazz!  You came here to read
about me anyway, didn't ya?  When I'm not working on...Work. I
am generally either spending time with the family, gaming at night or
trying to excel myself in some fashion - currently re-learning guitar and 
getting deep into my foray into learning new spoken languages.

I am attempting to make this site a sizeable chunk of my life, I want to spread
the wealth of knowledge as many have done before me.


##### How It Was Built

###### The Back-End

First thing's first, the site is a pretty basic site and the portions that you see
are all static.  There's a catch though, no I don't write the articles in HTML, I
write them in [Markdown](http://daringfireball.net/projects/markdown/).  The static
side of the site, everything you see and that is on the server, is all *compiled*
by a *library* called [Pelican](http://blog.getpelican.com/).  Ever heard of Jekyll?
It's the same concept except Pelican is built on-top of Python which is my language
of choice for most projects.  If you want to find out more then follow the link
above.

That's actually about it for the back-end minus a Pelican plugin I made while
writing up this article. It's called [pelican-readtime](https://github.com/JenkinsDev/pelican-readtime),
basically it does what the name suggests and determines what
the average read time would be for Pelican content and stores that value in
an attribute called `readtime` in the content's object.  The "algorithm" that is used to
calculate the read time is based off of Medium's read time "algorithm."


###### The Front-End

The front-end of this site is your basic HTML, CSS and JavaScript.  During development
of the assets, CSS and JavaScript, I make use of a build system called
[GulpJS](http://gulpjs.com/).


##### Conclusion

Well guys I think that's all I am going to cover in this here "Hello, World"
introduction.  I am hoping to make this a useful resource for everyone.
If you have any questions then just leave it down below in the comments section.
I'll make sure to check the comments frequently!

Auf Wiedersehen!
