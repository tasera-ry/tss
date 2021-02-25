const nodemailer = require('nodemailer');
const services = require('./services');

const sendEmail = async function(message, emailAddress, opts) {
  const emailSettings = await services.emailSettings.read();

  if (emailSettings.shouldSend !== "true") {
    return;
  }

  try {
    const toMail = emailAddress;
    const subject = 'Tasera info';
    //defaults message to command if for some reason fails in switch
    let text = message;
    let auth;
    if (typeof emailSettings.user !== 'undefined'){
      auth = {
        user: emailSettings.user,
        pass: emailSettings.pass,
      };
    }
    else{
      auth = null;
    }


    switch (message) {
    case 'assigned':
      text = 'Hei, teille on annettu valvojavuoro. Voitte nyt käydä vahvistamassa vuoronne. Terveisin TASERA ry';
      break;
    case 'update':
      text = 'Hei, teille annettua valvojavuoroa on muutettu. Voitte nyt käydä tarkistamassa vuoronne. Terveisin TASERA ry';
      break;
    case 'reminder':
      text = 'Hei, ette ole varmistaneet viikon päästä alkavaa valvonta vuoroanne. Käykää pian varmistamassa vuoronne. Terveisin TASERA ry';
      break;
    case 'decline':
      text = 'Hei, ' + opts.user + ' perui päävalvojavuoronsa päivältä ' + opts.date + '. Päävalvoja pitää vaihtaa mitä pikimmiten. Terveisin TASERA ry';
      break;
    case 'feedback':
      text = 'Hei, ' + opts.user + ' lähetti juuri palautteen:\n\n' + opts.feedback + '\n\nTerveisin TASERA ry';
      break;
    }

    let transporter = nodemailer.createTransport({
      host: emailSettings.host,
      port: emailSettings.port,
      secure: emailSettings.secure === "true",
      auth: auth,
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: emailSettings.sender,
      to: toMail,
      subject: subject,
      text: text,
    });
    
    console.log('Message sent: %s', info.messageId);

  } catch (error){
    console.error(error);
  }


};
module.exports = { sendEmail };
