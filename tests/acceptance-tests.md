# Acceptance Tests

Below are the acceptance tests for each implemented user story.

## US-01: User can view events

**Given** the user is on the home page
**When** they click the "Events" tab
**Then** they see a list of available events with title, date, and location displayed

##US-02: User can save an event to their personal calendar
**Given** the user is viewing the events list
**When** they click the "Save" button
**Then** the event appears in the "My Calendar" section

## US-03: User can remove an event from tehir calendar

**Given** the user has an event saved in "My Calendar"
**When** they click the "Remove" button
**Then** the event disappears from "My Calendar"

##US-04 : User can view details of a specific event (if applicable)
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

# Notes

- These acceptance tests are executed manually to validate the features of each user story.
- All stories in Sprint 1, Sprint 2, Sprint 3 must appear here.
