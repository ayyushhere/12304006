const Log = async (stack, level, pkg, message) => {
  const url = "http://4.224.186.213/evaluation-service/logs";
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJheXVzaGt1bWFyMDIxMWFAZ21haWwuY29tIiwiZXhwIjoxNzc4NzU3OTcxLCJpYXQiOjE3Nzg3NTcwNzEsImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiIyYjdjOTQ4My1mNzliLTQzNmQtOGU2ZS04NTg1MDJlMjA2YTgiLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJheXVzaCBrdW1hciIsInN1YiI6IjBlNGVhMDRkLTBiN2ItNDY4Zi05MTUyLTNhZjVjNzY3YWU2OCJ9LCJlbWFpbCI6ImF5dXNoa3VtYXIwMjExYUBnbWFpbC5jb20iLCJuYW1lIjoiYXl1c2gga3VtYXIiLCJyb2xsTm8iOiIxMjMwNDAwNiIsImFjY2Vzc0NvZGUiOiJUUnZaV3EiLCJjbGllbnRJRCI6IjBlNGVhMDRkLTBiN2ItNDY4Zi05MTUyLTNhZjVjNzY3YWU2OCIsImNsaWVudFNlY3JldCI6InFOekpzRmR6Q3JyQk14dkUifQ.ToKLVJiMYdSsoCyf6U2uwMmAYJ1X_xC1oupZtU28opI"; 

  const payload = {
    stack: stack,
    level: level,
    package: pkg,
    message: message
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      console.log(`[${stack}] Log successfully sent to test server.`);
    }
  } catch (error) {
    console.error("Failed to send log", error);
  }
};

module.exports = { Log };