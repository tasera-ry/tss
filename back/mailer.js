// include nodemailer
const nodemailer = require('nodemailer');



const sendEmail = (sposti, viesti) => {
    

    // declare vars,
    // let reciever = sposti;
    let reciever = 'elias.penkkimaki@gmail.com';
    let fromMail = 'infotestitasera';
    let toMail = reciever;
    let subject = 'Tasera info';
    let text = '';

    switch (viesti) {
        case "assigned":
            text = 'Hei teille on annettu vuoro'
        break;
        case "reminder":
            text = 'Hei ette ole vahvistaneet vuoroanne'
        break;    
    }

    

    const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: fromMail ,
        pass: 'tasera2020'
    }
    }); 
    // email options
    let mailOptions = {
    from: fromMail,
    to: toMail,
    subject: subject,
    text: text
    };
    transporter.sendMail(mailOptions, (error, response) => {
    if (error) {
        console.log(error);
    }
    console.log(response)
    });
}
