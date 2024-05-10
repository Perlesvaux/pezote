const express = require('express')
const app = express()
const port = 3000

const cheerio = require('cheerio');
const axios = require('axios');


// Enable CORS (import module and use it globally)
const cors = require('cors')
app.use(cors())

// Enable usage of CLI tools
const { spawn } = require('child_process');

// Configure body-parser
const bodyParser = require('body-parser')
app.use(bodyParser.text({type:"text/plain"}))
app.use(bodyParser.urlencoded({extended:false}))

// Simple Logger =D
function MWLogger (req, res, next){
  console.log(`${req.method} ${req.path} ${req.ip}`)
  next()
}

app.post("/ask", async(req, res)=>{

  try {
  const metadata = await axios.get(req.body.path2video)
    .then(response => {
      const html = response.data;
      const $ = cheerio.load(html);
      const title = $('title').text();
      return title;
    });

  res.send(metadata);
    
  } catch (error) {
    console.error(error)
    res.send('')
  }

});


// Form has a 'outputFormat'field. User selects 'Original', 'mp3', etc.
// Form has a 'path2video' field. This is where video URL goes.
// when user submits the POST-request, the server responds with a file.
app.post("/",  MWLogger, async(req, res) => {

    // Early exit if invalid format
    if (!['original', 'mp3'].includes(req.body.outputFormat)) return res.end();

    // res.setHeader('Content-Type', 'audio/mp3');
    // res.setHeader('Content-Disposition', `attachment; filename="romulo"`);
    res.setHeader('Content-Disposition', `attachment`);

    const cmd = 'yt-dlp';
    let args = ['-q', '-o', '-', `${req.body.path2video}`];
    if (req.body.outputFormat!='original') args = [...args, '|', 'ffmpeg', '-i', 'pipe:0', '-f', `${req.body.outputFormat}`, 'pipe:1'];



    // Convert to mp3
    // const process = spawn('yt-dlp', ['-q', '-o', '-', `${req.body.path2video}`, '|', 'ffmpeg', '-i', 'pipe:0', '-f', 'mp3', 'pipe:1'], {shell:true})
  
    // Download original file
    // const process = spawn('yt-dlp', ['-q', '-o', '-', `${req.body.path2video}`])
    
    const process = spawn(cmd, args, {shell:true});

    process.stdout.on('data', (data)=>{
      res.write(data);
    })

    process.on('close', (code)=>{
      if (code!== 0) console.error(`LONG PIPE process exited with code: ${code}`);
      res.end()
    })

});



//App is ready to go!
app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`)
})

