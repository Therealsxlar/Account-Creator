const fs = require('fs').promises;
const path = require('path');

module.exports = {
    name: 'create',
    description: 'Create an account',
    async execute(message, args) {
        const accountsPath = path.join(__dirname, '..', 'accounts.json');

        let accounts = {};
        try {
            const data = await fs.readFile(accountsPath, 'utf8');
            accounts = JSON.parse(data);
        } catch (err) {
            if (err.code !== 'ENOENT') {
                console.error('Error reading accounts file:', err);
            }
        }

        if (accounts[message.author.id]) {
            message.reply('You already have an account.');
            return;
        }

        const filter = response => {
            return response.author.id === message.author.id;
        };

        message.reply('What is your email?').then(() => {
            message.channel.awaitMessages(filter, { max: 1, time: 60000, errors: ['time'] })
                .then(async collected => {
                    const email = collected.first().content;
                    message.reply('What is your password?').then(() => {
                        message.channel.awaitMessages(filter, { max: 1, time: 60000, errors: ['time'] })
                            .then(async collected => {
                                const password = collected.first().content;
                                accounts[message.author.id] = { email, password };
                                try {
                                    await fs.writeFile(accountsPath, JSON.stringify(accounts, null, 4));
                                    message.reply('Account created successfully!');
                                } catch (err) {
                                    console.error('Error writing accounts file:', err);
                                    message.reply('There was an error creating your account.');
                                }
                            })
                            .catch(() => {
                                message.reply('You took too long to enter your password.');
                            });
                    });
                })
                .catch(() => {
                    message.reply('You took too long to enter your email.');
                });
        });
    },
};