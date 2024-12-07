from flask import Flask, request, jsonify
from flask_cors import CORS
from sympy import symbols, integrate
import re

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes


@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.get_json()
    # print(data)
    expression = data.get('expression')

    solve_content = re.search(r'solve\((.*?)\)', expression)
    if solve_content:
        solve_content = solve_content.group(1)
        parts = solve_content.split(',')
        if len(parts) == 2 and '=' in parts[0] and parts[1].strip() in parts[0]:
            left_side, right_side = parts[0].split('=')
            if left_side.strip() and right_side.strip():
                print(f"Content inside solve() is valid: {solve_content}")
            else:
                print(f"Invalid content inside solve(): {solve_content} - Both sides of '=' must have an expression.")
        else:
            print(f"Invalid content inside solve(): {solve_content}")


    # print(expression)
    variable = data.get('variable', 'x')
    lower_limit = data.get('lower_limit')
    upper_limit = data.get('upper_limit')

    try:
        x = symbols(variable)
        expr = eval(expression)
        if lower_limit is not None and upper_limit is not None:
            result = integrate(expr, (x, lower_limit, upper_limit))
        else:
            result = integrate(expr, x)

        return jsonify({'success': True, 'result': str(result)})

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})


if __name__ == '__main__':
    app.run(debug=True, port=5000)
