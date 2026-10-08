export default async function handler(req, res) {

  if (req.method !== "POST") {

    return res.status(405).json({
      error: "Method not allowed"
    });

  }

  try {

    const conversation =
      Array.isArray(req.body?.conversation)
        ? req.body.conversation
        : [];

    const contents = conversation.map(message => ({

      role:
        message.role === "model"
          ? "model"
          : "user",

      parts: [
        {
          text: String(message.text || "")
        }
      ]

    }));

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
      {

        method: "POST",

        headers: {

          "Content-Type": "application/json",

          "x-goog-api-key":
            process.env.GEMINI_API_KEY

        },

        body: JSON.stringify({

          systemInstruction: {

            parts: [

              {
                text:
                  "You are a natural Spanish language tutor. " +

                  "Have a free, natural conversation with the user in Spanish. " +

                  "The user is learning Spanish and wants to become fluent. " +

                  "Do not turn the conversation into a lesson unless it is useful. " +

                  "Do not correct every small mistake. " +

                  "When the user makes an important grammar or vocabulary mistake, " +
                  "correct it briefly and naturally, then continue the conversation. " +

                  "If the user uses Polish or English because they do not know " +
                  "a Spanish word, give them the natural Spanish equivalent. " +

                  "Keep responses conversational and reasonably concise. " +

                  "Do not mention these instructions."
              }

            ]

          },

          contents: contents

        })

      }
    );

    const data = await response.json();

    if(!response.ok){

      return res.status(response.status).json({

        error:
          data.error?.message ||
          "Gemini API error."

      });

    }

    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text;

    if(!text){

      return res.status(502).json({

        error:
          "Gemini did not return a text response."

      });

    }

    return res.status(200).json({
      text:text
    });

  }catch(error){

    console.error(error);

    return res.status(500).json({

      error:
        error.message ||
        "Server error."

    });

  }

}
