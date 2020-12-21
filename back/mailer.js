const nodemailer = require('nodemailer');

const sendEmail = async function(message, emailAddress, opts) {
  try {
    const toMail = emailAddress;
    const subject = 'Tasera info';
    //defaults message to command if for some reason fails in switch
    let text = message;
    if (typeof process.env.EMAIL_USER !== 'undefined'){
      auth = null;
    }
    else{
      auth = {
      user: process.env.EMAIL_USER, // generated ethereal user
      pass: process.env.EMAIL_PASSWORD, // generated ethereal password
    };
    }


    switch (message) {
    case 'assigned':
      text = 'Hei, teille on annettu valvojavuoro. Voitte nyt käydä vahvistamassa vuoronne. Terveisin TASERA ry';
      break;
    case 'update':
      text = 'Hei, teille annettua valvojavuoroa on muutettu. Voitte nyt käydä tarkistamassa vuoronne. Terveisin TASERA ry';
      break;
    case 'decline':
      text = 'Hei, ' + opts.user + ' perui päävalvojavuoronsa päivältä ' + opts.date + '. Päävalvoja pitää vaihtaa mitä pikimmiten. Terveisin TASERA ry';
      break;
    case 'feedback':
      text = 'Hei, ' + opts.user + ' lähetti juuri palautteen:\n\n' + opts.feedback + '\n\nTerveisin TASERA ry';
      break;
    }

    let transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE,
      auth: auth,
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: toMail,
      subject: subject,
      text: text,
    });
    
    console.log("Message sent: %s", info.messageId);

  }catch (error){
    console.error(error);
  }


};
module.exports = sendEmail;
