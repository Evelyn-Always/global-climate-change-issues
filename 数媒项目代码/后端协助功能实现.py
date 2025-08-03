import sqlite3
from flask import Flask, request, jsonify, session, send_from_directory, g
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
import os

app = Flask(__name__, static_folder='.')
app.secret_key = 'super-secret-key'
CORS(app)

DATABASE = os.path.join(os.path.dirname(__file__), 'users.db')

# ----------- 数据库辅助函数 -----------
def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row
    return db

def query_db(query, args=(), one=False):
    cur = get_db().execute(query, args)
    rv = cur.fetchall()
    cur.close()
    return (rv[0] if rv else None) if one else rv

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def init_db():
    with app.app_context():
        db = get_db()
        db.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL
            );
        ''')
        db.commit()

# ----------- 路由 -----------
@app.route('/')
def index():
    return send_from_directory('.', '147.html')

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    if not username or not password:
        return jsonify({'error': '用户名或密码不能为空'}), 400
    # 检查用户名是否存在
    user = query_db('SELECT * FROM users WHERE username = ?', [username], one=True)
    if user:
        return jsonify({'error': '用户名已存在'}), 400
    password_hash = generate_password_hash(password)
    db = get_db()
    db.execute('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, password_hash])
    db.commit()
    return jsonify({'msg': '注册成功'})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    user = query_db('SELECT * FROM users WHERE username = ?', [username], one=True)
    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({'error': '用户名或密码错误'}), 401
    session['username'] = username
    return jsonify({'msg': '登录成功', 'username': username})

@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('username', None)
    return jsonify({'msg': '已退出登录'})

@app.route('/api/profile', methods=['GET'])
def profile():
    username = session.get('username')
    if not username:
        return jsonify({'error': '未登录'}), 401
    return jsonify({'username': username, 'msg': '你已登录'})

@app.route('/api/ai_sentiment', methods=['POST'])
def ai_sentiment():
    data = request.json
    text = data.get('text', '').strip()
    if not text:
        return jsonify({'success': False, 'msg': '文本不能为空', 'sentiment': None}), 400

    # --- 简单本地分析（规则/词典法） ---
    positive_words = ['热', '好', '开心', '喜欢', '晴朗', '美好', '优秀', '舒适']
    negative_words = ['冷', '坏', '难过', '讨厌', '暴雨', '灾害', '糟糕', '不舒服']

    score = 0
    for w in positive_words:
        if w in text:
            score += 1
    for w in negative_words:
        if w in text:
            score -= 1

    if score > 0:
        sentiment = '正面'
        msg = '分析成功：该文本情感倾向为正面'
    elif score < 0:
        sentiment = '负面'
        msg = '分析成功：该文本情感倾向为负面'
    else:
        sentiment = '中性'
        msg = '分析成功：该文本情感倾向为中性'

    return jsonify({
        'success': True,
        'msg': msg,
        'sentiment': sentiment,
        'score': score
    })

@app.route('/<path:filename>')
def serve_html_files(filename):
    if filename.endswith('.html'):
        return send_from_directory('.', filename)
    else:
        return "Not Found", 404




# ----------- 初始化数据库（第一次运行时） -----------
if __name__ == '__main__':
    init_db()
    app.run(port=5000)