---
layout: layouts/page.njk
title: Contact
description: "Book a consultation with Meridian Consulting. Tell us where you're stuck and we'll tell you how we'd approach it."
permalink: /contact/
---

Tell us where you're stuck. We'll respond within one business day with a candid
take on whether — and how — we can help.

<div class="contact-details">
  <p><strong>Email:</strong> <a href="mailto:{{ brand.contact.email }}">{{ brand.contact.email }}</a></p>
  <p><strong>Phone:</strong> <a href="{{ brand.contact.phone | telHref }}">{{ brand.contact.phone }}</a></p>
  <p><strong>Office:</strong> <a href="{{ brand.contact.mapUrl }}">{{ brand.contact.address }}</a></p>
  <p><strong>Hours:</strong> {{ brand.contact.hours }}</p>
</div>
