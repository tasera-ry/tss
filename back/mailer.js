//require('dotenv').config();
// include nodemailer



    //step1
    const nodemailer = require('nodemailer');
    const sendEmail = function(sposti,viesti) {
    // declare vars,
    let reciever = 'elias.penkkimaki@gmail.com';
    let fromMail = 'infotestitasera@gmail.com';
    let toMail = reciever;
    let subject = 'Tasera info';
    let text = viesti;

    //editing the reciever to suit sending the email (change str = viesti to str = sposti) for production
    let str = viesti;
    let cutStr = str.slice(11, -3)
    text = cutStr;   
/*
     switch (viesti) {
        case "assigned":
            text = 'Hei teille on annettu vuoro';
        break;
        case "update":
            text = 'Jokin on muuttunut';
        break;
    }*/

    //step2:
    const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        //user: process.env.EMAIL,
        //pass: process.env.PASSWORD,
        user: fromMail ,
        pass: 'tasera2020'
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
    console.log(response)
    });
}
module.exports = sendEmail;
