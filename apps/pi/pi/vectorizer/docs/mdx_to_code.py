import re


def mdx_to_curl(mdx_content):
    """Converts MDX content to cURL command with appropriate headers and data."""
    # Extract API method and endpoint
    api_match = re.search(r"api:\s*(\w+)\s+(.+)", mdx_content)
    if not api_match:
        return "Invalid MDX format: API method and endpoint not found"

    method, endpoint = api_match.groups()

    # Build the base curl command
    curl_command = f"curl --request {method} \\\n"
    curl_command += f" --url https://api.plane.so{endpoint} \\\n"

    # Add headers
    curl_command += " --header 'x-api-key: <api-key>'"

    # Add Content-Type header for POST, PATCH, or PUT requests
    if method in ["POST", "PATCH"]:
        curl_command += " \\\n --header 'Content-Type: application/json'"

    # Extract body parameters
    body_params = re.findall(r'<ParamField body="(\w+)" type="(\w+)".*?>', mdx_content)

    # Add --data option for POST, PATCH requests
    if body_params and method in ["POST", "PATCH"]:
        curl_command += " \\\n --data '{\n"
        for param, param_type in body_params:
            curl_command += f'  "{param}": "<{param_type}>",\n'
        curl_command = curl_command.rstrip(",\n") + "\n}'"

    return curl_command


def mdx_to_go(mdx_content):
    """Converts MDX content to Go code using net/http package."""
    # Extract API method and endpoint
    api_match = re.search(r"api:\s*(\w+)\s+(.+)", mdx_content)
    if not api_match:
        return "Invalid MDX format: API method and endpoint not found"

    method, endpoint = api_match.groups()

    # Start building the Go code
    go_code = "package main\n"
    go_code += "import (\n"
    go_code += '"fmt"\n'
    go_code += '"net/http"\n'
    go_code += '"io/ioutil"\n'
    if method in ["POST", "PATCH"]:
        go_code += '"strings"\n'
    go_code += ")\n"
    go_code += "func main() {\n"
    go_code += f'url := "https://api.plane.so{endpoint}"\n'

    # Extract body parameters
    body_params = re.findall(r'<ParamField body="(\w+)" type="(\w+)".*?>', mdx_content)

    # Add payload for POST or PATCH requests
    if body_params and method in ["POST", "PATCH"]:
        go_code += 'payload := strings.NewReader("{\n'
        for param, param_type in body_params:
            go_code += f' \\"{param}\\": \\"<{param_type}>\\",\n'
        go_code = go_code.rstrip(",\n") + '\\n}")\n'
    else:
        go_code += "payload := nil\n"

    # Create request
    go_code += f' req, _ := http.NewRequest("{method}", url, payload)\n'
    go_code += ' req.Header.Add("x-api-key", "<api-key>")\n'
    if method in ["POST", "PATCH"]:
        go_code += ' req.Header.Add("Content-Type", "application/json")\n'

    # Send request and handle response
    go_code += " res, _ := http.DefaultClient.Do(req)\n"
    go_code += " defer res.Body.Close()\n"
    go_code += " body, _ := ioutil.ReadAll(res.Body)\n"
    go_code += " fmt.Println(res)\n"
    go_code += " fmt.Println(string(body))\n"
    go_code += "}"

    return go_code


def mdx_to_java(mdx_content):
    """Converts MDX content to Java code with Unirest HTTP client implementation."""
    # Extract API method and endpoint
    api_match = re.search(r"api:\s*(\w+)\s+(.+)", mdx_content)
    if not api_match:
        return "Invalid MDX format: API method and endpoint not found"

    method, endpoint = api_match.groups()

    # Start building the Java code
    java_code = f'HttpResponse<String> response = Unirest.{method.lower()}("https://api.plane.so{endpoint}")\n'
    java_code += ' .header("x-api-key", "<api-key>")\n'

    # Extract body parameters
    body_params = re.findall(r'<ParamField body="(\w+)" type="(\w+)".*?>', mdx_content)

    # Add Content-Type header and body for POST or PATCH requests
    if body_params and method in ["POST", "PATCH"]:
        java_code += ' .header("Content-Type", "application/json")\n'
        java_code += ' .body("{\n'
        for param, param_type in body_params:
            java_code += f' \\"{param}\\": \\"<{param_type}>\\",\n'
        java_code = java_code.rstrip(",\n") + '\\n}")\n'

    # Add .asString() at the end
    java_code += " .asString();"

    return java_code


def mdx_to_js(mdx_content):
    """Converts MDX content to JavaScript code using fetch API."""
    # Extract API method and endpoint
    api_match = re.search(r"api:\s*(\w+)\s+(.+)", mdx_content)
    if not api_match:
        return "Invalid MDX format: API method and endpoint not found"

    method, endpoint = api_match.groups()

    # Build the options object
    options = f"const options = {{method: '{method}', headers: {{'x-api-key': '<api-key>'}}"

    # Add Content-Type header for POST or PATCH requests
    if method in ["POST", "PATCH"]:
        options += ", 'Content-Type': 'application/json'"

    # Extract body parameters
    body_params = re.findall(r'<ParamField body="(\w+)" type="(\w+)".*?>', mdx_content)

    # Add body for POST or PATCH requests
    if body_params and method in ["POST", "PATCH"]:
        options += ", body: '{"
        for param, param_type in body_params:
            options += f'"{param}":"<{param_type}>",'
        options = options.rstrip(",") + "}'"

    options += "};"

    # Build the fetch call
    js_code = f"{options}\n"
    js_code += f"fetch('https://api.plane.so{endpoint}', options)\n"
    js_code += " .then(response => response.json())\n"
    js_code += " .then(response => console.log(response))\n"
    js_code += " .catch(err => console.error(err));"

    return js_code


def mdx_to_php(mdx_content):
    """Converts MDX content to PHP code using cURL for API requests."""
    # Extract API method and endpoint
    api_match = re.search(r"api:\s*(\w+)\s+(.+)", mdx_content)
    if not api_match:
        return "Invalid MDX format: API method and endpoint not found"

    method, endpoint = api_match.groups()

    # Start building the PHP code
    php_code = "<?php\n"
    php_code += "$curl = curl_init();\n"
    php_code += "curl_setopt_array($curl, [\n"
    php_code += f' CURLOPT_URL => "https://api.plane.so{endpoint}",\n'
    php_code += " CURLOPT_RETURNTRANSFER => true,\n"
    php_code += ' CURLOPT_ENCODING => "",\n'
    php_code += " CURLOPT_MAXREDIRS => 10,\n"
    php_code += " CURLOPT_TIMEOUT => 30,\n"
    php_code += " CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\n"
    php_code += f' CURLOPT_CUSTOMREQUEST => "{method}",\n'

    # Extract body parameters
    body_params = re.findall(r'<ParamField body="(\w+)" type="(\w+)".*?>', mdx_content)

    # Add CURLOPT_POSTFIELDS for POST or PATCH requests
    if body_params and method in ["POST", "PATCH"]:
        php_code += ' CURLOPT_POSTFIELDS => "{\n'
        for param, param_type in body_params:
            php_code += f' \\"{param}\\": \\"<{param_type}>\\",\n'
        php_code = php_code.rstrip(",\n") + '\n"},\n'

    # Add headers
    php_code += " CURLOPT_HTTPHEADER => [\n"
    if method in ["POST", "PATCH"]:
        php_code += '"Content-Type: application/json",\n'
    php_code += '"x-api-key: <api-key>"\n'
    php_code += " ],\n"
    php_code += "]);\n"

    # Add response handling
    php_code += "$response = curl_exec($curl);\n"
    php_code += "$err = curl_error($curl);\n"
    php_code += "curl_close($curl);\n"
    php_code += "if ($err) {\n"
    php_code += ' echo "cURL Error #:" . $err;\n'
    php_code += "} else {\n"
    php_code += " echo $response;\n"
    php_code += "}"

    return php_code


def mdx_to_python(mdx_input):
    """Converts MDX content to Python code with appropriate API calls and parameters."""
    # Extract API details
    api_match = re.search(r"api: (\w+) (.+)", mdx_input)
    if not api_match:
        return "Invalid MDX input: API details not found"

    method, endpoint = api_match.groups()

    # Replace path parameters
    endpoint = endpoint.replace("{", "{").replace("}", "}")

    # Extract body parameters
    body_params = re.findall(r'<ParamField body="(\w+)" type="(\w+)".*?>', mdx_input)

    # Create Python code
    python_code = "import requests\n"
    python_code += f'url = "https://api.plane.so{endpoint}"\n'

    if body_params:
        python_code += "payload = {\n"
        for param, param_type in body_params:
            python_code += f'    "{param}": "<{param_type}>",\n'
        python_code += "}\n"

    python_code += 'headers = {\n    "x-api-key": "<api-key>"'
    if method in ["POST", "PATCH", "PUT"]:
        python_code += ',\n    "Content-Type": "application/json"'
    python_code += "\n}\n"

    if body_params:
        python_code += f'response = requests.request("{method}", url, json=payload, headers=headers)\n'
    else:
        python_code += f'response = requests.request("{method}", url, headers=headers)\n'

    python_code += "print(response.text)\n"

    return python_code
