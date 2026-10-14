import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

// Dynamic config.js endpoint if environment variables are provided
app.get('/config.js', (req, res) => {
  res.type('application/javascript');
  const envUrl = process.env.SUPABASE_URL || '';
  const envKey = process.env.SUPABASE_ANON_KEY || '';

  if (envUrl && envKey) {
    return res.send(`window.MAKE_INC_CONFIG = {
  supabaseUrl: ${JSON.stringify(envUrl)},
  supabaseAnonKey: ${JSON.stringify(envKey)}
};`);
  }

  const configPath = path.join(__dirname, 'config.js');
  if (fs.existsSync(configPath)) {
    return res.sendFile(configPath);
  }

  res.send(`window.MAKE_INC_CONFIG = { supabaseUrl: '', supabaseAnonKey: '' };`);
});

// Serve static assets from project directory
app.use(express.static(__dirname));

// Single Page Application fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`MAKE.INC Employee Portal running on http://${HOST}:${PORT}`);
});
