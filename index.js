const fs = require('fs');
const Discord = require('discord.js');
const { config } = require('process');
const client = new Discord.Client();
client.commands = new Discord.Collection();
const Config = JSON.parse(fs.readFileSync('config.json'));

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.on('ready', () => {
    console.log('\x1b[31m%s\x1b[0m', `${client.user.tag} is online!`);
});

client.on('message', message => {
    if (!message.content.startsWith('!') || message.author.bot) return;

    const args = message.content.slice('!'.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (!client.commands.has(command)) return;

    try {
        client.commands.get(command).execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('There was an error executing that command.');
    }
});

client.login(Config.Token);