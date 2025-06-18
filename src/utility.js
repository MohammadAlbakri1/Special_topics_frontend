import emailjs from '@emailjs/browser';

const sendTicketEmail = (user) => {
  const { name, email, event_title, location, date } = user;

  const templateParams = {
    name,
    email,
    event_title,
    location,
    date,
  };

  emailjs.send(
    'service_d1its8j',
    'template_jqg3v1i',
    templateParams,
    'u4hA255nkOY8s4Wtk'
  )
  .then((res) => {
    console.log('✅ Email sent!', res.status, res.text);
  })
  .catch((err) => {
    console.error('❌ Email failed:', err);
  });
};

export default sendTicketEmail;
