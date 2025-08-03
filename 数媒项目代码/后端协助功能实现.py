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
    return send_from_directory('.', '111111.html')

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

@app.route('/api/news', methods=['GET'])
def get_news():
    news_data = [
        {
            "id": 1,
            "title": "2025年全国气候大会召开，发布最新减排政策",
            "date": "2025-08-02",
            "summary": "大会上，国家相关部门发布了新的气候减排目标和政策措施。",
            "content": "2025年全国气候大会于8月2日在北京召开，会议聚焦气候变化与减排战略。相关部门发布了最新碳排放政策，包括2026年前实现碳达峰目标、推进新能源发展等措施……",
        },
        {
            "id": 2,
            "title": "绿色金融新规出台，支持低碳项目",
            "date": "2025-08-01",
            "summary": "绿色金融再升级，推动低碳经济发展。",
            "content": "近日，人民银行联合多部委出台绿色金融新规，鼓励银行加大对低碳项目的信贷支持，提高绿色债券发行额度……",
        }
        # 你可以继续添加更多新闻
    ]
    return jsonify({"code": 0, "data": news_data})

@app.route('/api/analyze', methods=['POST'])
def analyze_news():
    data = request.json
    news_id = data.get('newsId')
    content = data.get('content', '')
    # 模拟AI分析结果（后期可接入大模型接口）
    if news_id == 1:
        analysis = "本次气候大会颁布的新减排政策反映了国家对碳排放问题的高度重视，旨在缓解气候变暖带来的环境压力，同时推动经济结构向绿色低碳转型。背后问题包括产业升级压力与能源结构调整难题。"
    elif news_id == 2:
        analysis = "绿色金融新规出台，反映了国家对低碳经济的政策支持与金融体系转型需求。背后问题是绿色项目融资难、传统金融体系对环境风险重视不足。"
    else:
        analysis = "该政策/新闻的颁布体现出我国对气候、环境政策的高度关注，背后涉及经济、社会、产业结构以及国际合作等多重问题。"
    return jsonify({"code": 0, "analysis": analysis})

@app.route('/api/alerts/data', methods=['GET'])
def get_alerts_data():
    # 可替换为真实数据源，模拟三类预警
    alerts = [
        {
            "name": "沿海台风",
            "level": "高",
            "impact": 60,
            "desc": "强台风即将登陆，影响范围广，建议加强防范。",
            "details": "预计08-04凌晨登陆，最大风力12级，影响城市：A、B、C。"
        },
        {
            "name": "内陆暴雨",
            "level": "中",
            "impact": 40,
            "desc": "内陆地区暴雨，部分道路受阻。",
            "details": "预计08-04上午出现强降雨，影响城市：D、E。"
        },
        {
            "name": "西部高温",
            "level": "低",
            "impact": 20,
            "desc": "西部地区高温持续，注意防暑降温。",
            "details": "最高气温达41℃，持续时间预计3天。"
        }
    ]
    return jsonify({"code": 0, "alerts": alerts})

@app.route('/api/alerts/sandbox', methods=['POST'])
def sandbox_simulate():
    # 获取前端参数
    response_time = request.json.get('responseTime', 6)
    media_inclination = request.json.get('mediaInclination', 'neutral')
    # 简化推演逻辑
    if response_time <= 6 and media_inclination == 'positive':
        result = "响应及时且舆论积极，预警事件快速平息。"
    elif response_time > 12 and media_inclination == 'negative':
        result = "响应迟缓且媒体消极，舆情升级，风险扩大。"
    else:
        result = "舆情与响应适中，预警事件逐步控制。"
    chain = [
        "气象异常", "社交热议", "政策回应", "舆情变化", "风险控制"
    ]
    return jsonify({"result": result, "chain": chain})

@app.route('/api/alerts/holo', methods=['GET'])
def get_holo_alert():
    # 高等级预警示例
    alert = {
        "title": "台风橙色预警！",
        "keydata": "影响区域：沿海城市 | 风力：12级 | 预计到达时间：08-04 02:00",
        "advice": "AI建议：加强防风措施，及时发布权威信息。"
    }
    return jsonify(alert)

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
