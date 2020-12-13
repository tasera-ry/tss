require('dotenv').config();
//step1
const nodemailer = require('nodemailer');

const sendEmail = function(message, emailaddress) {
  try{    
    // declare vars,
    let fromMail = process.env.EMAIL;
    //editing the recieved email string to correct usable form.
    let toMail = emailaddress.slice(11, -3);
    let subject = 'Tasera info';
    //defaults message to command if for some reason fails in switch
    let text = message;

    switch (message) {
    case 'assigned':
      text = 'Hei, teille on annettu valvojavuoro. Voitte nyt käydä vahvistamassa vuoronne. Terveisin TASERA ry';
      break;
    case 'update':
      text = 'Hei, teille annettua valvojavuoroa on muutettu. Voitte nyt käydä tarkistamassa vuoronne. Terveisin TASERA ry';
      break;
    }

    //step2:
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      }
    });

    //step3:
    // email options
    let mailOptions = {
      from: fromMail,
      to: toMail,
      subject: subject,
      text: text
    };

    //step4:
    transporter.sendMail(mailOptions, (error, response) => {
      if (error) {
        console.log(error);
      }
      console.log(response);
    });
  }catch (error){
    console.error(error);
  }

};
module.exports = sendEmail;
