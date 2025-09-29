const Client = require('ssh2-sftp-client');
const sftpClient = new Client();
const path = require('path');
const clc = require("cli-color");

const ftpFolderPath = '/uploads/plbl/';

class SFTP {
    static async upload(uploadedFolderPath) {
        return new Promise(async (resolve, reject) => {
            if (!process.env.crada_sftp_p || !process.env.crada_sftp_u || !process.env.crada_sftp_ip) {
                console.log(new Error('!!! No access !!!'));
                return;
            }

            let config = {
                host: process.env.crada_sftp_ip,
                username: process.env.crada_sftp_u,
                password: process.env.crada_sftp_p,
                port: 22                
            };     
            
            let uploadedFiles = [];

            await sftpClient.connect(config);

            sftpClient.on('upload', info => {
                let link = info.source;                
                link = link.replace(uploadedFolderPath + path.sep, '');
                link = link.replace(/\\/g, '/');                          
                uploadedFiles.push( link );                
            });

            await sftpClient.uploadDir(uploadedFolderPath, ftpFolderPath);
            sftpClient.end();

            printInfo(uploadedFiles);

            resolve();
        })
    }
}

function printInfo(files) {
    console.log(clc.green('======================'));
    files.forEach((link) => {
        if (link.indexOf('info') == -1 && link.indexOf('.html') !== -1) {
            console.log(clc.green(`https://static.crada.io/plbl/${link}`));
        }
    });

    console.log('');
    console.log(clc.green('DEVICE:'));

    files.forEach((link) => {
        if (link.indexOf('info') == -1 && link.indexOf('.html') !== -1) {
            console.log(clc.green(`https://static.crada.io/plbl/device.html?page=${link}`));
        }
    });

    console.log('');
    console.log(clc.green('INFO:'));

    files.forEach((link) => {
        if (link.indexOf('info.html') !== -1) {
            console.log(clc.green(`https://static.crada.io/plbl/${link}`));
        }
    });

    console.log(clc.green('======================'));
}

module.exports = SFTP;