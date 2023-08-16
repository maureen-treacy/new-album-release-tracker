# Obstacles
1. Had to make sure that the database wasnt adding duplicate albums everytime we refreshed the API. For example, when we first built the code, it would bring the Oliva Rodirgo album in each time we refreshed the API. We added a for each look and created a variable before the if statement to check if the album ID already existed before adding the new album.


#Mistakes
1. Removing one instance of duplicate entries for saved albums. Pull took out all the instances of a specific album but we only wanted to remove one


# Project | New Album Tracker


## Description

An App that lets users track newly released albums on Spotify. They can save albums that they want to listen to and review in a library. 

## User Stories
- 404 - As a user I want to see a nice 404 page when I go to a page that doesn’t exist so that I know it was my fault
- 500 - As a user I want to see a nice error page when the super team screws it up so that I know that is not my fault
- homepage - As a user I want to be able to access the homepage and filter by type of genre, log in and sign up.
- sign up - As a user I want to sign up on the web page so that I can view my saved new albums.
- login - As a user I want to be able to log in on the web page so that I can get back to my account
- logout - As a user I want to be able to log out from the web page so that I can make sure no one will access my account
saved albums list - As a user I want to see the list of albums that I saved and want to review.
- All albums - As a user I want to be able to see all albums released that week
- Albums by genre - As a user I want to see the list of newly released albums filtered by genre.
- Album details - As a user I want to see more details of the album and edit information regarding my review

## Server Routes (Back-end)

- Route: /
  - Method: Get
  - Description: Main page route. Renders home index view

- Route: /login
  - Method: Get
  - Description: Renders login form view
  - Request - 

- Route: /login
  - Method: Post
  - Description: Sends login form data to the server
  - Request - Body: {email, password}

- Route: /signup
  - Method: Get
  - Description: Renders signup form view
  - Request - 

- Route: /signup
  - Method: Post
  - Description: Sends signup form data to the server
  - Request - Body: {email, password}

  - Route: /all-albums
    - Method: Get
    - Description: Renders all-albums form view to display all new albums; incldues option to pick by genre 

  - Route: /by-genre
    - Method: Get
    - Description: Renders by-genre form view to display albums by genre

  - Route: /album-details/:id
    - Method: Get
    - Description: Renders album details for selected album
    - Request - Body: {id}

  - Route: /album-details/:id
    - Method: post
    - Description: Sends review information for selected album
    - Request - Body: {id}

    <!-- What does it mean to be private?  -->

  - Route: /private/savedAlbums
    - Method: Get
    - Description: Renders albums that user selected to review
    - Request -

  - Route: /private/savedAlbums
    - Method: post
    - Description: Sends review information for selected album
    - Request -
  


## Models

- User Model

{
  name: String,
  email: String,
  password: String,
  savedAlbums: [myAlbumsId],
}

- Album Model
{
  name: String,
  image: [
    url: String,
    height: integer,
    width: integer
  ]
  release_date: String,
  release_date_precision: String,
  album_type: String,
  total_tracks: Integer,
  available_markets: [String],
  external_urls: {
    spotify: String,
  }
  href: String,
  id: String,
  genre: [array of strings],
  artists: [
    id: String,
    name: String,
    image: [
      url: String,
      height: Integer,
      width: Integer
    ]
  ],
  tracks: {
    href: String,
    limit: Integer,
    next: String,
    offset: Integer,
    previous: String,
    total: String,
    items: [
      artists: [
        external_urls{
          spotify: String
        },
        href: string,
        id: String
        name: String,
        type: String,
        uri: String
      ]
      available_market: [strings],
      disc_number: Integer,
      duration_ms: Integer,
      explicit: Boolean
      external_urls: {},
      href: String
      id: String,
      is_playable: Boolean,
      linked_from: {},
      restrictions: {},
      name: String,
      preview_url: String,
      track_number: Integer,
      type: String,
      uri: String,
      is_local: Boolean
    ]
  }

}


- Review Model
{
saveAlbum: Boolean,
rating: Number,
review: String,
shareWith: String
}


- Saved Albums model

{
  placeId: String,
}

- Genre model





### APIs

https://developer.spotify.com/documentation/web-api/reference/get-new-releases

   
### Packages
express 
hbs 
spotify-web-api-node 
dotenv


## Backlog
Not sure what this is 

## links

### Git



### Slides


### Contributors




