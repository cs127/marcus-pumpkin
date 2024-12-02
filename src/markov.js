const fs = require("fs");

const {min, floor, random} = Math;
const randInt = (n) => min(floor(random() * n), n - 1);


var Markov;


function markovLoad()
{
	var Markov = {};

	try {Markov = JSON.parse(fs.readFileSync("markov.json"));}
	catch (_)
	{
		console.error("failed to read the markov chain file.\n" +
		              "if this is your first time running the bot, " +
		              "this is normal.");
	}

	return Markov;
}


function markovProcSave(m)
{
	var words = m.content.split(/\s+/);
	words.push("");

	for (var i = 0; i < words.length - 1; i++)
	{
		const word = words[i].toLowerCase();
		const next = words[i + 1];

		if (!Markov[word])
			Markov[word] = {};

		if (!Markov[word][next])
			Markov[word][next] = 0;

		Markov[word][next]++;
	}

	try {fs.writeFileSync("markov.json", JSON.stringify(Markov, null, ""));}
	catch (_) {console.error("failed to update the markov chain file.");}
}


function markovGen(first)
{
	if (!first)
	{
		const keys = Object.keys(Markov);
		if (!keys.length) return null;

		first = keys[randInt(keys.length)];
	}

	var s = first;
	var current = first.toLowerCase();

	while (Markov[current] && Object.keys(Markov[current]).length)
	{
		var choices = Object.entries(Markov[current]);
		var cweights = [choices[0][1]];
		var j;

		for (j = 1; j < choices.length; j++)
		{
			cweights[j] = choices[j][1] + cweights[j - 1];
		}

		const rnd = random() * cweights[cweights.length - 1];

		for (j = 0; j < cweights.length; j++)
		{
			if (cweights[j] > rnd) break;
		}

		current = choices[j][0];
		if (!current) break;

		s += ` ${current}`;

		current = current.toLowerCase();
	}

	return s;
}


Markov = markovLoad();


module.exports =
{
	markovProcSave,
	markovGen
};
