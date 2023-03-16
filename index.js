const TelegramBot = require('node-telegram-bot-api')
const express = require('express')
const cors = require('cors')
const token = '6246547294:AAEKRriladEqIpp1tN4ecpzTjFqc-rocp00'
const bot = new TelegramBot(token, { polling: true })
const webAppUrl = 'https://legendary-cranachan-8caeff.netlify.app'
const app = express()
app.use(express.json())
app.use(cors())

bot.on('message', async msg => {
	const chatId = msg.chat.id
	const text = msg.text

	if (text === '/start') {
		await bot.sendMessage(chatId, 'A button will appear below. Fill out the form.', {
			reply_markup: {
				keyboard: [[{ text: 'Fill in the form', web_app: { url: `${webAppUrl}/form` } }]]
			}
		})
		await bot.sendMessage(chatId, 'Visit our store using the button below.', {
			reply_markup: {
				inline_keyboard: [[{ text: 'Make an order', web_app: { url: webAppUrl } }]]
			}
		})
	}

	if (msg?.web_app_data?.data) {
		try {
			const data = JSON.parse(msg?.web_app_data?.data)

			await bot.sendMessage(chatId, 'Thanks for feedback!')
			await bot.sendMessage(chatId, `Your country: ${data?.country}`)
			await bot.sendMessage(chatId, `Your street: ${data?.street}`)
			setTimeout(async () => {
				await bot.sendMessage(chatId, 'All information you will receive in this chat')
			}, 3000)
		} catch (e) {
			console.log(e)
		}
	}
})

app.post('/web-data', async (req, res) => {
	const { queryId, products = [], totalPrice } = req.body

	try {
		await bot.answerWebAppQuery(queryId, {
			type: 'article',
			id: queryId,
			title: 'Successful purchase',
			input_message_content: {
				message_text: `Congratulations on your purchase! You have purchased goods (${products
					.map(p => p.title)
					.join(', ')}) totaling ${totalPrice}$.`
			}
		})

		return res.status(200).json({})
	} catch (e) {
		await bot.answerWebAppQuery(queryId, {
			type: 'article',
			id: queryId,
			title: 'Failed to purchase goods.',
			input_message_content: {
				message_text: 'Failed to purchase goods.'
			}
		})

		return res.status(500).json({})
	}
})

const PORT = 8000
app.listen(PORT, () => console.log(`server started on PORT ${PORT}`))
