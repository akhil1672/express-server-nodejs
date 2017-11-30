const express = require('express')
const fs = require('fs');
const shuffle = require('shuffle-array');
const bodyparser=require('body-parser');
let app = express();
app.use(bodyparser());
let flag=0;
app.use(function (req, res, next) {
    let logfile = fs.createWriteStream("logs.txt", { 'flags': 'a' });
    logfile.write("\r\nFile accessed at " + new Date() + "\r\n");
    logfile.end();
    next();
})
app.get('/',function(req,res)
{
    res.sendFile('form.html',{root: './'});
});
app.post('/',function(req,res)
{
    //console.log(req.body);
    let filepath=req.body.path;
    let size=req.body.teamsize;
    fs.readFile(filepath, function (err, data) {
        if(err)
        {
            console.log("Error");
            res.writeHead(404);
            res.write(`<center><h1>Error accessing the file</h1></center>`);
            res.end();
        }
        else if(!data)
        {
            console.log("No data");
            res.writeHead(404);
            res.write(`<center><h1>No data in file or empty file</h1></center>`);
            res.end();            
        }
        else
        {
            let json = JSON.parse(data);
            json = shuffle(json);
            let jsonlength = json.length;
            var noofteams = Math.ceil(jsonlength / size);
            if (size < 1) {
                console.log("Size cannot be 0 or negative " + err);
                res.writeHead(404);
                res.write(`<center><h1>Size cannot be 0 or negative </h1></center>`);
                res.end();
                flag=1;
            }
            else if (size > jsonlength) {
                console.log("Size cannot be greater than no of students" + err);
                res.writeHead(404);
                res.write(`<center><h1>Size cannot be greater than no of students</h1></center>`);
                res.end();
                flag=1;
            }
            else if (isNaN(noofteams)) {
                console.log("Invalid entry!");
                res.writeHead(404);
                res.write(`<center><h1>Invalid entry!</h1></center>`);
                res.end();
                flag=1;
            }
            var extra = jsonlength % size;
            if(flag!=1)
            {
                console.log("No of students:" + jsonlength);
                console.log("No of teams:" + noofteams);
                createTeams(json, jsonlength, size);
            }
        }
        function createTeams(json, jsonlength, size) {
            let j = 1, k = 0;
            console.log("CREATING TEAMS!");
            console.log("Team " + j);
            let ws = fs.createWriteStream("teams.txt");
            ws.write("-------------------------------------\r\n");
            ws.write("Team " + j + "\r\n");
            ws.write("-------------------------------------\r\n");
            for (let i = 0; i < jsonlength; i++ , k++) {
                if (k >= size) {
                    j++;
                    console.log("Team " + j);
                    ws.write("-------------------------------------\r\n");
                    ws.write("Team " + j + "\r\n");
                    ws.write("-------------------------------------\r\n");
                    k = 0;
                }
                console.log(json[i].name);
                ws.write(json[i].name + "\r\n");
            }
            ws.on('finish', () => {
                console.log('wrote all data to file');
            });
            ws.end();
            /*let logfile=fs.createWriteStream("logs.txt",{'flags':'a'});
            logfile.write("\r\nFile accessed at "+new Date()+"\r\n");
            logfile.end();*/
            let fileread = fs.createReadStream('C:/Users/Akhil/Documents/VScode/randomteamcreator/teams.txt');
            fileread.pipe(res);
        }
    });
});
app.listen(3000,(err)=>{
        console.log("listening to port 3000");
});