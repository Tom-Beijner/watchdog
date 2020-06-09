import BaseCommand from "../../structures/BaseCommand";
import Context from "../../structures/Context";
import config from "../../config.json";
import { inspect } from "util";
import DiscordEmbed from "../../utils/DiscordEmbed";
import { Message } from "eris";

export default class Eval extends BaseCommand {
    constructor() {
        super({
            name: "eval",
            description: "Run code inside of the bot",
            usage: "eval <code>",
            aliases: [],
            requirements: [],
            deleteMessage: false,
        });
    }

    async execute(ctx: Context) {
        const message: Message = await ctx.send("Evaluating code...");
        const code: string = ctx.args.join(" ");
        const embed: DiscordEmbed = new DiscordEmbed().setTitle("Eval");

        function redact(code: string) {
            const tokens = [
                config.bot.token,
                config.database.host,
                config.database.username,
                config.database.password
                    .replace("*", "\\*")
                    .replace("^", "\\^"),
            ];

            const regex = new RegExp(tokens.join("|"), "gi");
            return code.replace(regex, "|REDACTED|");
        }

        try {
            let result: Eval | string = await eval(code);
            if (typeof result !== "string") {
                result = inspect(result, {
                    depth: +!inspect(result, { depth: 1 }),
                    showHidden: false,
                });
            }

            const res = redact(result);
            embed.addField("Output", `\`\`\`js\n${res}\`\`\``);
            await message.edit({ content: "", embed: embed.getEmbed() });
        } catch (e) {
            embed.setColor(parseInt(config.bot.color));
            embed.addField("Error", `\`\`\`js\n${e.message}\`\`\``);
            await message.edit({ content: "", embed: embed.getEmbed() });
        }
    }
}