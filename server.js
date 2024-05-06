/*** Express setup & start ***/

// Importeer de zelfgemaakte functie fetchJson uit de ./helpers map
import fetchJson from './helpers/fetch-json.js'

// Importeer het npm pakket express uit de node_modules map
import express, { response } from 'express'

// Maak een nieuwe express app aan
const app = express()

// Stel ejs in als template engine
app.set('view engine', 'ejs')

// Stel de map met ejs templates in
app.set('views', './views')

// Gebruik de map 'public' voor statische resources, zoals stylesheets, afbeeldingen en client-side JavaScript
app.use(express.static('public'))

// Zorgt dat werken met request data makkelijker wordt
app.use(express.urlencoded({extended: true}))

// Stel het poortnummer in waar express op moet gaan luisteren
app.set('port', process.env.PORT || 8000)

// Start express op, haal daarbij het zojuist ingestelde poortnummer op
app.listen(app.get('port'), function () {
  // Toon een bericht in de console en geef het poortnummer door
  console.log(`Application started on http://localhost:${app.get('port')}`)
})

/*** Routes & data ***/
const redpersUrl = 'https://redpers.nl/wp-json/wp/v2/'
const directusUrl = 'https://fdnd-agency.directus.app/items/redpers_shares'
const postsUrl = redpersUrl + 'posts'
const categoriesUrl = redpersUrl + 'categories'
const authorUrl = redpersUrl + 'users'
const categoriesData = [
  {"id": 9, "name": "Binnenland", "slug": "binnenland"},
  {"id": 1010, "name": "Buitenland", "slug": "buitenland"}, 
  {"id": 7164, "name": "Column", "slug": "column"},
  {"id": 6, "name": "Economie", "slug": "economie"},
  {"id": 4, "name": "Kunst & Media", "slug": "kunst-media"},
  {"id": 3211, "name": "Podcasts", "slug": "podcast"},
  {"id": 63, "name": "Politiek", "slug": "politiek"},
  {"id": 94, "name": "Wetenschap", "slug": "wetenschap"},
]
const date = new Map();
const getDate = `day = parsedDate.getDate(), 
  short = {month: "short"},
  long = {month: "long"}, 
  monthShort = Intl.DateTimeFormat("nl-NL", short).format(parsedDate), 
  monthLong = Intl.DateTimeFormat("nl-NL", long).format(parsedDate),
  year = parsedDate.getFullYear(),
  hours = (parsedDate.getHours() < 10 ? '0' : ' ') + parsedDate.getHours(), 
  minutes = (parsedDate.getMinutes() < 10 ? '0' : '') + parsedDate.getMinutes(), 
  time = hours + ':' + minutes, 
  dayMonth = day + ' ' + monthShort,
  dayMonthYear = day + ' ' + monthLong + ' ' + year,
  fullDate = day + ' ' + monthLong + ' ' + year + ', ' + time;`

date.set('day-month', `const parsedDate = new Date(postData[i].date),
  ${getDate}
  postData[i].date = dayMonth`);

date.set('day-month-year', `const parsedDate = new Date(postData[i].date),
  ${getDate}
  postData[i].date = dayMonthYear`)

date.set('full-date', `const parsedDate = new Date(postData[0].date),
  ${getDate}
  postData[0].date = fullDate`)

// Maak een GET route voor de home
app.get('/', function (request, response) {
  //fetch alleen de velden id, date, slug, title, yoast_head_json.author, yoast_head_json.og_image
  //Haal 51 per pagina op
  fetchJson(postsUrl + '?_fields=date,slug,title,yoast_head_json.author,yoast_head_json.twitter_misc,yoast_head_json.og_image,jetpack_featured_media_url&per_page=28').then((postData) => {
  // Render home.ejs uit de views map en geef de opgehaalde data mee als variabele
  // HTML maken op basis van JSON data

    // Voor alle posts
    // Zet de string data uit API om naar een datum die er mooi uit ziet
    for (var i=0; i < postData.length; i++) {
      eval(date.get('day-month'))
    }

    response.render('home', {posts: postData, categories: categoriesData})
  })
})

// Maak een GET route voor de category
app.get('/categorie/:slug', function (request, response) {
  // maak const category aan
  // Vind in de array categoriesData de category.slug die gelijk is aan de request.params.slug
  const category = categoriesData.find((category) => category.slug == request.params.slug);

  // Doe meerdere fetchJson voor de posts en de categorie data
  // Haal 20 posts op die deze categorie hebben en haal de velden date, slug, title, yoast_head_json.og_image uit de API
  // Haal deze category op met als velden name, yoast_head
  Promise.all([fetchJson(postsUrl + '?categories=' + category.id + '&_fields=date,slug,title,yoast_head_json.og_image,jetpack_featured_media_url&per_page=20'), 
    fetchJson(categoriesUrl + '/?slug=' + request.params.slug + '&_fields=name,yoast_head')]).then(([postData, category]) => {
    // Render catogorie.ejs uit de views map en geef de opgehaalde data mee als variabele
    // HTML maken op basis van JSON data

      // Voor alle posts die in postData zitten
      // Zet de string data uit API om naar een datum die er mooi uit ziet
      for (var i=0; i < postData.length; i++) {
        eval(date.get('day-month-year'))
      }

    response.render('category', {posts: postData, category: category, categories: categoriesData});
  })
})

// Maak een GET route voor de post
app.get('/artikel/:slug', function (request, response) {
   // Haal voor deze post alleen deze velden op
  Promise.all([fetchJson(postsUrl + '/?slug=' + request.params.slug + '&_fields=date,slug,title,author,content,excerpt,categories,yoast_head,yoast_head_json.author,yoast_head_json.twitter_misc,yoast_head_json.og_image'), 
    fetchJson(categoriesUrl + '?_fields=id,name,slug&per_page=100'),
    fetchJson(authorUrl + '?_fields=id,slug,name,description,avatar_urls&per_page=100')]).then(([postData, categoryData, authorData]) => {
    // Render post.ejs uit de views map en geef de opgehaalde data mee als variabele, genaamd persons
    // HTML maken op basis van JSON data
    
    fetchJson(directusUrl).then((shares) => {
      // Map de postData array uit wordpress, map is een soort 'loop' structuur voor arrays
      postData.map((article) =>
        // Gebruik de Object.assign() functie om het aantal shares toe te voegen op het article
        // NB: Object.assign past het 'article' object
        Object.assign(article, {
          // Zoek in shares naar shares.slug en of het gelijk is aan de params.slug, 
          // koppel het aantal shares of 0 als het niet bestaat
          shares: shares.data.find((shares) => shares.slug == request.params.slug)?.shares || 0,
        })
      ) 

      // filter de categorie zodat je de juite naam kan tonen
      // kijk naar de eerste categorie in de lijst
      let filterCategorie = categoryData.filter(category => {
        return category.id == postData[0].categories[0]
      })

      let filterAuthor = authorData.filter(author =>{
        return author.id == postData[0].author
      })

      // Zet de string data uit API om naar een datum die er mooi uit ziet
      eval(date.get('full-date'))
      
      response.render('post', {post: postData, categories: categoriesData, category: filterCategorie, author: filterAuthor})
    })  
  })
})

app.post('/artikel/:slug', (request, response) => {
  fetchJson(directusUrl + '?filter[slug][_eq]=' + request.params.slug).then(({data}) => {
    // Doe een PATCH op directus, stuur de id mee als die er is.
    fetchJson(`${directusUrl}/${data[0]?.id ? data[0].id : ''}`, {
      method: data[0]?.id ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: request.params.slug,
        shares: data.length > 0 ? data[0].shares + 1 : 1,
      }),
    })
  })
  response.redirect(301, '/artikel/' + request.params.slug)
})

app.get('/auteur/:slug', function (request, response) {
  Promise.all([fetchJson(authorUrl + '?slug=' + request.params.slug), 
    fetchJson(postsUrl + '?_fields=date,slug,title,author,yoast_head_json.twitter_misc,yoast_head_json.og_image,jetpack_featured_media_url&per_page=100')]).then(([authorData, postData]) => {
      
      // Voor alle posts
      // Zet de string data uit API om naar een datum die er mooi uit ziet
      for (var i=0; i < postData.length; i++) {
        eval(date.get('day-month'))
      }

      let filterPost = postData.filter(post =>{
        return post.author == authorData[0].id
      })

      response.render('author', {author: authorData, posts: filterPost, categories: categoriesData })
    })
})  