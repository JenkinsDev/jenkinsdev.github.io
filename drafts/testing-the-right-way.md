---
title: Testing the Right Way
date: 2023-05-24
tags: [testing, programming, development, unit, integration, blackbox]
---

> NOTE:
>
> This is heavily a work in progress and will be published as guide once I have finished.

* Why test?
    * How does it help?
        * Proper testing helps to ensure stability within software systems
        * They're only as helpful as you make them
    * TDD / BDD
        * Not bogus, but they're bogus
        * Context and situation matter, a lot
* When to test
    * Maybe, Maybe Not: (depends on stability needs, complexity, and how fast you need to move)
        * One-off private projects
        * Building a MVP (Minimally Viable Product)
        * Remember, software development best practices are a factor of their scale!
    * Definitely:
        * Automotive
        * Aerospace
        * Operating Systems
        * Established B2C or B2B service/application/product
* How to properly test
    * Focused on unit & integration tests
    * Unit
        * Isolated testing of a singular piece of your entire system. No dependencies, idempotent output (even for non-idempotent methods)
        * Easy to become brittle due to mocking
            * but also a useful codesmell - if you find yourself mocking too much maybe you should break it down
        * When used appropriately and effectively, unit tests are a great way to help refactor at a micro level
        * Used to be a huge fan of unit tests, now prefer integration tests
    * Integration
        * Integration tests should test an entire logic path
            * Testing an HTTP call? (HTTP Request -> Controller -> Business Logic -> Serialized Response)
                * Your tests should

## Why should I test?

Think on the last time a piece of software you were using just didn't quite hit the quality mark you were expecting. How did it make you feel? Frustrated?

While not everyone will be working on projects that "require" the nine-nines of availability (avg of <= 86.40 microseconds downtime per day), testing is still an important aspect of what we do. But... **It's also not.**

So, how do you know when testing is something you should be sinking your time into?

### How does it help?

Proper testing helps to ensure stability within a given software system. But, they're only as helpful as you make them to be. It's as straightforward as that.

Automated tests can be mentally modeled around the idea of testing a black-box. You have a given slice of logic you'd like to test (your black-box), you define your inputs and an expected outcome; then compare what your black-box generates against your expected outcome.

You can likely deduce exactly how stacking tests can increase the reliability of your system as a whole.

## When should I test?

## What should I test?
