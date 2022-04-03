//need to npm init in /Upload folder, and npm i fs axios
let fs = require("fs");
let axios = require("axios");
//this file can read video from /Upload which in media array below
let media = ["secretVideo.mp4"];
//then uploaded video's CID will be push to the ipfsArray below
let ipfsArray = [];
let promises = [];
//promises array will make sure the loads of the above files fulffied

for (let i = 0; i < media.length; i++) {
  promises.push(
    new Promise((res, rej) => {
      fs.readFile(`${__dirname}/export/${media[i]}`, (err, data) => {
        if (err) rej();
        ipfsArray.push({
          path: `media/${i}`,
          content: data.toString("base64"),
        });
        res();
      });
    })
  );
}
//promise waiting for the ipfs arrays to fill with elements elements, then post to ipfs
Promise.all(promises).then(() => {
  axios.post(
    "https://deep-index.moralis.io/api/v2/ipfs/uploadFolder",
    ipfsArray,
    {
      headers: {
        "X-API-KEY"://web3 API
          "BtcXDQvBFKEDn2NgAsUXvMGOXTr8XAjNXA2SJUixZ6scqMLm8I9h9fXGqdebuWgP",
        "Content-Type": "application/json",
        accept: "application/json",
      },
      maxContentLength: Infinity,//for large files
      maxBodyLength: Infinity,
    }
  ).then((res) => {
    console.log(res.data);
  })
  .catch((error) => {
    console.log(error);
  });
});
