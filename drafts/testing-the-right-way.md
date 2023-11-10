---
title: Testing the Right Way
date: 2023-05-24
tags: [testing, programming]
---

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
