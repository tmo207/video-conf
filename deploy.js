import ftp from 'basic-ftp';

const deploy = async () => {
  const client = new ftp.Client();
  client.ftp.verbose = true;
  try {
    await client.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      secure: true,
    });
    console.log(await client.list());
    client.trackProgress((info) => console.log(info.bytesOverall));
    await client.ensureDir(process.env.FTP_PATH);
    await client.clearWorkingDir();
    await client.uploadFromDir('build', process.env.FTP_PATH);
    await client.uploadFrom('build', process.env.FTP_PATH);
  } catch (err) {
    console.log(err);
  }
  client.close();
};

deploy();
