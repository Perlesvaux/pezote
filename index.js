const express = require('express')
const app = express()
const port = 3000

// Enable CORS (import module and use it globally)
const cors = require('cors')
app.use(cors())

// Enable usage of CLI tools
const { spawn } = require('child_process');

// Configure body-parser
const bodyParser = require('body-parser')
app.use(bodyParser.text({type:"text/plain"}))
app.use(bodyParser.urlencoded({extended:false}))

// Configure multer to handle file upload
// const multer  = require('multer')
// const upload = multer({ dest: 'uploads/' })

// Import file-system module
// const fs = require('fs')


// Simple logger =D
function MWLogger (req, res, next){
  console.log(`${req.method} ${req.path} ${req.ip}`)
  next()
}


// Form has a 'path2video' field. This is where video URL goes.
// when user submits the POST-request, the server responds with a file.
app.post("/",  MWLogger, (req, res) => {

    // console.log(req.body)
    // console.log(req.body.path2video)

    res.setHeader('Content-Type', 'audio/mp3');
    // res.setHeader('Content-Type', 'text/plain');
    // res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', 'attachment; filename=example1');

    // const process = spawn('whisper', [`uploads/${req.file.filename}`, '--model', 'base', '--language=Spanish', '--output_dir', 'text']);
    // const process = spawn('echo', [`hello world!`]);
    // const process = spawn('cat', ['package.json', '|', 'grep', "body"], {shell:true});
// 'yt-dlp', ['-q', '-o', '-', `${req.body.path2video}`, '|', 'ffmpeg', '-i', 'pipe:0', '-f', 'mp3', 'pipe:1', '|', 'cat', '>', 'example1.mp3' ]
    // const process = spawn('yt-dlp', ['-q', '-o', '-', `${req.body.path2video}`, '|', 'ffmpeg', '-i', 'pipe:0', '-f', 'mp3', 'pipe:1', '|', 'cat' ])
    // const process = spawn('yt-dlp', ['-q', '-o', '-', `${req.body.path2video}`, '|', 'ffmpeg', '-i', 'pipe:0', '-f', 'mp3', 'pipe:1', '|' ])
    const ytdlp = spawn('yt-dlp', ['-q', '-o', '-', `${req.body.path2video}`])
    const ffmpeg = spawn('ffmpeg', ['-i', 'pipe:0', '-f', 'mp3', 'pipe:1'])
    // const ffmpeg = spawn('ffmpeg', ['-i', 'pipe:0', '-preset', 'slow', '-codec:a', 'libfdk_aac', '-b:a', '128k', '-codec:v', 'libx264', '-pix_fmt', 'yuv420p', '-b:v', '750k', '-minrate', '400k', '-maxrate', '1000k', '-bufsize', '1500k', '-vf', 'scale=-1:360', 'pipe:1'])


  //   process.on('close', (code) => {
  //     if (code !== 0) {
  //         return res.json({ err: `Process exited with code ${code}` });
  //     }
  //
  // 
  //     res.json({path2video:req.body.path2video});
  //
  //     // res.setHeader('Content-Disposition', `attachment; filename=${req.file.originalname}.txt`);
  //     // res.setHeader('Content-Type', 'application/octet-stream');
  //
  //     // return res.sendFile(__dirname + `/text/${req.file.filename}.txt`, (err) => {
  //     //     if (err) {
  //     //         return res.json({ err: err });
  //     //     }
  //     //     const remotion = [`text/${req.file.filename}.vtt`, `text/${req.file.filename}.txt`, `text/${req.file.filename}.tsv`, `text/${req.file.filename}.srt`, `text/${req.file.filename}.json`, `uploads/${req.file.filename}`];
  //     //     Promise.all(remotion.map(file => fs.promises.unlink(file)));
  //     // });
  // });
  
  

  ytdlp.stdout.on('data', (data) => {
    ffmpeg.stdin.write(data)
  });

  ytdlp.on('close', (code)=>{
    if (code!== 0) console.error(`yt-dlp process exited with code: ${code}`);
    ffmpeg.stdin.end();
  })

  ffmpeg.stdout.on('data', (data)=>{
    res.write(data);
  })

  ffmpeg.on('close', (code)=>{
    if (code!== 0) console.error(`ffmpeg process exited with code: ${code}`);
    res.end();

  })
  // ffmpeg.stdin

  process.on('close', (code)=>{
    if (code !== 0) {
      return res.json({ err: `Process exited with code ${code}` });
    }

    return res.end();


  })



  //   const process = spawn('whisper', [`uploads/${req.file.filename}`, '--model', 'base', '--language=Spanish', '--output_dir', 'text']);
  //
  //   process.on('close', (code) => {
  //     if (code !== 0) {
  //         return res.json({ err: `Process exited with code ${code}` });
  //     }
  //
  //     res.setHeader('Content-Disposition', `attachment; filename=${req.file.originalname}.txt`);
  //     res.setHeader('Content-Type', 'application/octet-stream');
  //
  //     return res.sendFile(__dirname + `/text/${req.file.filename}.txt`, (err) => {
  //         if (err) {
  //             return res.json({ err: err });
  //         }
  //         const remotion = [`text/${req.file.filename}.vtt`, `text/${req.file.filename}.txt`, `text/${req.file.filename}.tsv`, `text/${req.file.filename}.srt`, `text/${req.file.filename}.json`, `uploads/${req.file.filename}`];
  //         Promise.all(remotion.map(file => fs.promises.unlink(file)));
  //     });
  // });
});


//App is ready to go!
app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`)
})

