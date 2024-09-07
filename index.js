require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const { URL } = require('url');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json()); // Use express.json() to handle JSON payloads

// Serve static files from the 'public' directory
app.use('/public', express.static(`${process.cwd()}/public`));

// Serve the main HTML page
app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Array of objects to map links with an ID
const URLs = [];

// ID variable to be mapped with
let id = 0;

// POST request to create the shortened URL
app.post('/api/shorturl', (req, res) => {
  const { url: _url } = req.body;

  // Validate the URL format
  try {
    const parsed_url = new URL(_url);
    const hostname = parsed_url.hostname; // Extract hostname for DNS lookup

    if (!hostname) {
      // No hostname extracted, invalid URL
      return res.json({ "error": "invalid url" });
    }

    dns.lookup(hostname, (err) => {
      if (err) {
        return res.json({ "error": "invalid url" });
      } else {
        // Check if the URL already exists in the array
        const link_exists = URLs.find(l => l.original_url === _url);

        if (link_exists) {
          return res.json({
            "original_url": _url,
            "short_url": link_exists.short_url
          });
        } else {
          // Increment ID for each new valid URL
          id++;

          // Create an object for the new URL entry
          const url_object = {
            "original_url": _url,
            "short_url": `${id}`
          };

          // Add the new entry to the array
          URLs.push(url_object);

          // Return the new entry created
          return res.json({
            "original_url": _url,
            "short_url": id
          });
        }
      }
    });
  } catch (err) {
    return res.json({ "error": "invalid url" });
  }
});

// GET request to navigate to the URL
app.get('/api/shorturl/:id', (req, res) => {
  const { id: _id } = req.params;

  // Find the short URL in the array
  const short_link = URLs.find(sl => sl.short_url === _id);

  if (short_link) {
    return res.redirect(short_link.original_url);
  } else {
    return res.json({ "error": "invalid URL" });
  }
});

// Start the server
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
