# Acceptance Tests

Below are the acceptance tests for each implemented user story.

## US-01: User can view events

**Given** the user is on the home page
**When** they click the "Events" tab
**Then** they see a list of available events with title, date, and location displayed

## US-02: User can save an event to their personal calendar
**Given** the user is viewing the events list
**When** they click the "Save" button
**Then** the event appears in the "My Calendar" section

## US-03: User can remove an event from tehir calendar

**Given** the user has an event saved in "My Calendar"
**When** they click the "Remove" button
**Then** the event disappears from "My Calendar"

## US-04 : User can view details of a specific event (if applicable)
**Given** the user is on the events list
**When they click on an event title
**Then\*\* they see the event details (e.g. description, date, time)

## US-05: Organizer can create and track events

**Given** the organizer is on the organizer dashboard  
**When** they create a new event by entering a title, description, date/time, location, capacity, and ticketing details and save it  
**Then** the new event appears in their events list with the entered title, description, date/time, location, capacity, and ticketing information  
**And** they can open the event’s analytics view to see tickets, attendance, attendance rate, and remaining capacity  
**And** they can export the attendee list for the event as a CSV file  
**And** they can validate tickets for the event by uploading QR codes

## US-05: Organizer can create and track events

**Given** the organizer is on the organizer dashboard  
**When** they create a new event by entering a title, description, date/time, location, capacity, and ticketing details and save it  
**Then** the new event appears in their events list with the entered title, description, date/time, location, capacity, and ticketing information  
**And** they can open the event’s analytics view to see tickets, attendance, attendance rate, and remaining capacity  
**And** they can export the attendee list for the event as a CSV file  
**And** they can validate tickets for the event by uploading QR codes

## US-06: Student can browse and search campus events

**Given** the student is on the "Events" page  
**When** they open the page with no search or filters applied  
**Then** they see all upcoming events sorted by date  
**And** when they type a keyword into the search bar, the list updates to show only events whose title or description contains the keyword  
**And** when they apply filters for category, date range, or organization, the list updates to show only events matching the selected filters  
**And** when no events match the current search or filters, a "No events found." message is displayed

## US-07: User can claim tickets for an event

**Given** the user is on the event details page  
**When** they click the "Claim Ticket" button  
**Then** they are assigned a ticket for the event and the ticket appears in their "My Tickets" section

**And** when the event has a limited capacity  
**Then** claiming a ticket reduces the remaining capacity displayed for that event

**And** when the user has already claimed a ticket for the same event  
**Then** clicking "Claim Ticket" again does not assign a duplicate ticket and a message such as "Ticket already claimed" is shown

**And** when the event has no remaining capacity  
**Then** the "Claim Ticket" button is disabled or an error message such as "Event is full" is displayed

## US-08: System generates a unique QR code for each claimed ticket

**Given** the user has successfully claimed a ticket for an event  
**When** the ticket is added to their "My Tickets" section  
**Then** the user receives a digital ticket that includes a unique QR code linked to that specific event and their user account

**And** when the user views their ticket details  
**Then** the QR code is displayed clearly and is scannable

**And** when a second ticket is claimed for a different event  
**Then** a different unique QR code is generated for that ticket

**And** when the same user attempts to claim the _same_ ticket again  
**Then** no new QR code is generated and a message such as "Ticket already claimed" is displayed

## US-09: Organizer can view event analytics

**Given** the organizer has created an event  
**And** the event has ticket activity (tickets issued and/or attendees checked in)  
**When** the organizer opens the analytics dashboard for that event  
**Then** they see the total number of tickets issued for the event

**And** they see the event’s attendance rate based on tickets checked in  
**And** they see the remaining capacity for the event  
**And** all analytics values update correctly as ticket claims or check-ins change

## US-10: Admin can oversee the platform

**Given** an organizer has submitted an account for approval  
**When** the admin opens the "Organizer Approvals" page  
**Then** they can approve or reject the organizer’s account  
**And** approved organizers gain access to organizer features  
**And** rejected organizers are notified or have their access restricted accordingly

**Given** an event has been submitted by an organizer  
**When** the admin views the event listing in the moderation panel  
**Then** they can review the event details for policy compliance  
**And** they can approve the event to be published  
**And** they can reject or remove the event if it violates platform policies

## US-11: Admin can manage organizations and assign roles

**Given** an organization exists on the platform  
**When** the admin opens the "Organizations" management page  
**Then** they can view the list of all organizations registered on the platform

**And** when the admin selects an organization  
**Then** they can assign roles such as organizer, co-organizer, or staff to specific users  
**And** they can update or revoke these roles at any time

**And** when the admin makes changes to an organization’s roles  
**Then** the updated permissions take effect immediately for the affected users

## US-12: System provides a waitlist for full events

**Given** an event has reached its maximum capacity  
**When** a user attempts to claim a ticket  
**Then** the system offers the option to join the waitlist instead of receiving a ticket

**And** when the user confirms joining the waitlist  
**Then** their name appears in the event’s waitlist section  
**And** they do not receive a ticket yet

**And** when a spot becomes available (e.g., a ticket is cancelled)  
**Then** the next user in the waitlist is notified or automatically assigned the available ticket according to the platform’s rules

**And** when the user is moved from the waitlist to ticketed status  
**Then** the event’s remaining capacity and analytics update accordingly

# Notes

- These acceptance tests are executed manually to validate the features of each user story.
- All stories in Sprint 1, Sprint 2, Sprint 3 must appear here.
