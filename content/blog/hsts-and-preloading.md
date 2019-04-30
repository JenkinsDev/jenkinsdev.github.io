Title: HTTP Strict Transport Security (HSTS) &amp; Preloading
Date: 2019-04-30
Category: Web Security
Tags: https, hsts, security
Slug: http-strict-transport-security-and-preloading
Authors: David Jenkins
Summary: Did you know that merely redirecting an HTTP connection to HTTPS
         isn't as secure as you think? Your site is still susceptible to "man in the middle" (MITM) attacks
         which could leave your users vulnerable to phishing. Read on to figure out how you can help keep
         your users safe with just a tiny bit of extra effort!



##### Your 301 HTTP &rarr; HTTPS Redirection Isn't Sufficient

Your end-users are still very much susceptible to "man-in-the-middle" attacks which
could leave them vulnerable to phishing and eavesdropping (we're looking
at you NSA) attempts. The issue lies within how browsers handle requests that don't
explicity contain a scheme like "https://" &mdash; most default to "http://".

When your browser sends a HTTP request to a site that returns a 301 redirection
header, the end-user is still connecting to you &ndash; even if for just a second &ndash;
over an unsecured channel. If they're on public Wi-Fi or they've been infected with malware,
that unsecure request could be intercepted. At which point the malicious actor could then
stop the request from ever reaching your server and return a response that looks very much
like your own.

Your non-tech savvy users may not notice that they're not actually connected to your server.
They may see a page that looks identical to your own, go to submit their login details, and
wind up having their credentials stolen. BAM! Hit with phishing!

Now, put this into the context of a business such as
one in the banking sector... That'd turn into a disaster.

Before moving forward, I should make a note that what this article covers does not in any way
shape or form completely circumvent the possibility of a phishing attempt. This is merely
a way to compliment other security measures that should be taken.



##### In Comes HTTP Strict Transport Security

Thankfully, there is a standard to help us solve this problem. Defined in
[RFC 6797](https://tools.ietf.org/html/rfc6797), the HSTS RFC outlines a HTTP response header
that can be returned by your server to tell the user's browser that all future requests
*MUST* be over HTTPS and that it should *NEVER* connect to your site over plain HTTP.


###### Just Show Me How To Use It...
For those of you that find technical documentation cumbersome to scan through, here's
an example of the header:

```
Strict-Transport-Security: max-age=31536000; includeSubdomains
```

If you have any clue as to the structure of a HTTP header, this should be pretty self-explanatory. HSTS
is defined by the use of the header name `Strict-Transport-Security` which is accompanied with directives.

The only directive that is absolutely required is `max-age` which should be given
a value in seconds. This tells the browser how long it should enforce the policy
&mdash; in the example above we have it set to 1-year.

The optional `includeSubdomains` directive isn't accompanied by any values and is handled similar to a boolean,
it either exists or it doesn't. If included in your response the HSTS policy will include all subdomains
of the host's domain name.



###### Can I Revert These Changes?
Yes, you can! There are two ways you can have these changes reverted for connecting clients. You can either wait
out the time set by stopping the inclusion of the HSTS header and waiting out the `max-age` you set,
from that point. Or, you can have your server respond (over HTTPS!) with another HSTS header, but
giving the `max-age` directive a value of 0.

See below for an example of removing HSTS from the host and all of its subdomains:

```
Strict-Transport-Security: max-age=0; includeSubdomains
```


###### Caveats...
If your site becomes unavailable over HTTPS, a client abiding by the policy will not be able to
connect until the max-age has been hit. With this in mind, only ever make use of HSTS if you
know for certain you won't be defaulting back to HTTP any time soon.

It's 2019, generally speaking there's not many circumstances where non-HTTPS should be used!

Also, another caveat is that any clients that have never connected to your host, or ones that have had
their HSTS policy expire will still go through your HTTP &rarr; HTTPS redirection for the first request. This
isn't a ginormous attack vector, but *you can NEVER be too secure*. See the section "Hardening HSTS' Security
with Browser Preloading" to learn how you can circumvent this step for clients that support preloading.


###### Browser Support
As with all things relating to the web, it should come as no suprise that not all
browsers support this standard. This isn't your usual JavaScript or CSS lack of support
though, there are no real adverse effects on unsupported browsers if you implement.

See the compatability matrix below for a list of browsers that support the standard as of writing:

<a href="https://caniuse.com/#feat=stricttransportsecurity" target="_blank">
  ![HSTS Can I Use Screenshot. Click to go to page.]({attach}images/hsts-can-i-use.png)
</a>



##### Hardening HSTS' Security with Browser Preloading

Now that you have the HSTS header sent in your HTTPS responses, you should be good to go, right? Well... Yes
and no. There's an additional step you can take to help browsers know that your site should NEVER be allowed to
be accessed through HTTP. This is called browser preloading and is currently supported by most major
browser vendors.

HSTS preloading is where your domain is hard-coded into the browsers to never be allowed to be accessed via
HTTP. You can check and submit your domain by [clicking here](https://hstspreload.org/). In order to be accepted
into the preload list you must satisfy a few requirements.

1. Serve a valid certificate
2. Redirect all requests from HTTP to HTTPS on the same host, if you are listening on port 80
3. Serve all subdomains over HTTPS
4. Serve an HSTS header on the base domain for HTTPS requests:
  * `max-age` directive *MUST* be at least 1-year
  * `includeSubDomains` directive *MUST* be included
  * A third directive, `preload` must be included
  * Redirections must include HSTS headers as well

 As an example of a HSTS preload header:
 ```
 Strict-Transport-Security: max-age=31536000; includeSubdomains; preload
 ```

 Once you have those requirements met, you can use the link above to submit an inclusion request. Once your
 request has been vetted you'll find your HSTS preload inclusion rolled out generally in one or two browser
 stable releases (can be dependent on the browser vendor).
