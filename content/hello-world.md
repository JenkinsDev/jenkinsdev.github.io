Title: Hello World
Date: 2014-12-05
Category: General
Tags: greeting, python, development, web development
Slug: hello-world
Authors: David Jenkins
DisqusIdentifier: HelloWorld
Summary: This isn't your normal Hello World introduction, this is my personal
         introduction to you, my readers.  Find out who I am, what I do
         and what this _blog_ is going to be all about.  Don't be afraid to ask
         questions for I will most likely answer.



##### Come One, Come All

Welcome to my blog where I shall mind control and make you all work in my
developer sweat shop! Nah, I am just messing with you, though that would be
really nice, it would make my life easier!

On a more serious note, I'd like to welcome you, the reader, to my blog.  This
is going to be the breeding ground for some pretty gnarly content ranging from
simplistic programming concepts to more complex concepts like aspects of
game development.  Obviously this blog won't just be about programming though,
its going to be the home to a lot of my thoughts in general.


##### A Bit About Me

My name is David Jenkins and I currently work over at [Bold Media Group](https://boldmediagroup.com),
I create some pretty awesome things over there that revolves around
automation of tasks.  AUTOMATE EVERYTHING.  That's right, I am
a *HUGE* automation advocate, if it's a task that could be automated in some
form then you should work towards automating it.  Isn't that what a lot of
technology is for anyway?

Enough about that automation jazz and more about *me*!  You came here to read
about me anyway, didn't ya?  When I'm not working on Bold Media Group tasks I
am generally either spending time with the family, gaming (love gaming!) or
lending a helping hand to friends and/or open-source projects.  I'm a huge open-source
advocate too, it would seem I am a huge sucker for open-source automation
projects then, huh?

I am going to attempt to make this site a huge part of my life, I want to spread
the wealth of knowledge as many have done before me.  Speaking of the site I am
sure you all are pretty curious as to what's under this beautiful, I'm totally
humble okay, skin.  So here ya go:


##### How This Baby Was Built

Below I decided to separate up the Back-End from the Front-End since some people
will only be interested in specific sides.  If you want to know about both then
just go ahead and read both!  Want to see the source code yourself?  Great!  Because
it's all open-source guys: [check the baby out](https://github.com/JenkinsDev/DJenkinsDev).

###### The Back-End

First thing's first, the site is a pretty basic site and the portions that you see
are all static.  There's a catch though, no I don't write the articles in HTML, I
write them in [Markdown](http://daringfireball.net/projects/markdown/).  The static
side of the site, everything you see and that is on the server, is all *compiled*
by a *library* called [Pelican](http://blog.getpelican.com/).  Ever heard of Jekyll?
It's the same concept except Pelican is built on-top of Python which is my language
of choice for most projects.  If you want to find out more then follow the link
above and check it out, it's pretty rad.

That's actually about it for the back-end minus a nice Pelican plugin I made while
writing up this article.  It's called [pelican-readtime](https://github.com/JenkinsDev/pelican-readtime),
basically it does what the name suggests and algorithmically figures out what
the average read time would be for Pelican content and stores that value in
an attribute called `readtime` in the content's object.  The algorithm that is used to
calculate the read time is based off of Medium's read time algorithm.

###### The Front-End

The front-end of this site is your basic HTML, CSS and JavaScript.  During development
of the assets, CSS and JavaScript, I make use of a build system called
[GulpJS](http://gulpjs.com/).  GulpJS helps to automate, there's that word again, a
lot of the tedious tasks that are involved with front-end development.  This includes,
but is not limited to; LESS/SASS -> CSS compilation, CSS and JS file concatenation,
CSS and JS file minification and tons of other tasks.

If you haven't already checked GulpJS out, and you are in the front-end Web Dev
field, then you should do so *NOW*!  It's quite easy to set up and will, I
promise, make your life a lot easier as a developer.


##### Conclusion

Well guys I think that's all I am going to cover in this here Hello World
introduction.  I am hoping to make this an amazingly useful site for everyone.
If you have any questions then just leave it down below in the comments section.
I'll make sure to check the comments frequently!

Auf Wiedersehen!
