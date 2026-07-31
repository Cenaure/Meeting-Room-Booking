# Meeting Room Booking

A web application for booking and managing meeting rooms.

## Table of Contents

- [Getting Started](#getting-started)
- [Additional Implemented Features](#additional-implemented-features)

## Getting Started

### Prerequisites

Before running the project, make sure you have Docker and Docker Compose installed. You can find installation
instructions below:

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### 1. Clone the repository

```shell
git clone https://github.com/cenaure/Meeting-Room-Booking.git
cd Meeting-Room-Booking
```

### 2. Configure environment files

<!-- TODO: check if this section is still needed once Docker Compose uses prebuilt images -->

There are environment files in the project that need to be configured before running:

- [`.env.example`](./.env.example)
- [`./nest-server/.env.development.example`](./nest-server/.env.development.example)
- <!-- TODO: add remaining env file path(s) here -->

For each file, remove the `.example` suffix to activate it.

You can run the project in development mode without any further changes. For production mode, make sure to update
secrets, Google client credentials, and any other sensitive values.

### 3. Run the application

From the root of the project directory:

```shell
docker compose -f docker-compose.development.yml up --build
```

To run in detached mode (without streaming logs):

```shell
docker compose -f docker-compose.development.yml up -d --build
```

### 4. Open the application

Once the containers are up and running, open your browser and navigate to:

```
http://localhost:3000
```

## Additional Implemented Features

This section highlights notable features implemented beyond the core requirements, as outlined in the technical
specification (**section 05**).

1. **One-command setup with Docker Compose**
   The entire application stack can be built and launched with a single command.

2. **Email confirmation in development mode**
   New accounts must be activated via a confirmation email before they can be used. Unconfirmed accounts are restricted
   from making reservations, ensuring only verified users interact with the reservation system.

3. **Weekly recurring reservations**
   Users can book a room on a recurring weekly basis instead of creating individual bookings for each week.
    <!--TODO CANCELLATION-->

4. **Race condition avoidance**
   Booking requests are handled in a way that prevents two users from reserving the same room and time slot
   simultaneously, ensuring data consistency. Check [Race Condition Avoidance](#race-condition-avoidance)

5. **Upcoming reservation-end notifications**
   If a reservation is about to end and another reservation is scheduled to begin immediately afterward, the current
   user is notified in advance.

6. <!-- TODO: describe this feature -->

7. **Room filtering by capacity**
   Users can filter available rooms based on the number of people they need to accommodate, making it easier to find a
   suitable space.

8. <!-- TODO: describe this feature -->

## Race Condition Avoidance

Race condition avoidance is achieved by using NestJS queue to handle each reservation sequentially, it prevents two
users from reserving the same room and time slot simultaneously.

One queue processes single reservations and series of reservations one at a time using different handlers realising OCP
SOLID principle.

I assumed that the application is small or medium-sized, so the queue won't be a bottleneck working sequentially

If you expect a larger number of users to reserve rooms, this approach might be improved by creating a detached queue
for every room.