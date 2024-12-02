const {Client, Events, GatewayIntentBits} = require("discord.js");

const TOKEN = require("../token.json").token;


const Defs = require("./defs.js");

const {markovProcSave, markovGen} = require("./markov.js");


const INTENTS =
[
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.MessageContent
];
Defs.client = new Client({intents: INTENTS});

Defs.client.once(Events.ClientReady, init);
Defs.client.login(TOKEN);

Defs.client.on("messageCreate", hmsg);


const {min, floor, random} = Math;
const randInt = (n) => min(floor(random() * n), n - 1);
const comp = (s1, s2) => s1.toLowerCase().match(s2.toLowerCase());


var re;

function init()
{
	re = RegExp(`\\b${Defs.KEYWORD}\\b`, Defs.CASE_SENSITIVE ? "i" : "");

	console.log("ready");
}

function respond(m, reply)
{
	const words = m.content.split(/\s+/)
		.filter(word => !Defs.KEYWORD || !comp(word, Defs.KEYWORD))
		.filter(word => word != `<@${Defs.client.user.id}>`);
	const first = words[randInt(words.length)];
	const response = markovGen(first);

	if (!response) return;

	if (reply) m.reply(response);
	else m.channel.send(response);
}

function hmsg(m)
{
	if (m.author == Defs.client.user) return;

	markovProcSave(m);

	const mentions = m.mentions.users.hasAny(Defs.client.user.id);
	const has_keyword = Defs.KEYWORD && m.content.match(re);

	if (mentions || has_keyword) respond(m, mentions);
}

