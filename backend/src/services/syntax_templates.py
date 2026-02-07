# syntax_templates.py

SYNTAX_TEMPLATES = {
    "for_loop": {
        "title": "For Loop",
        "description": "Used to iterate over a sequence like a list, string, or range of numbers.",
        "syntax": "for variable in sequence:",
        "example": """for i in range(5):
    print(i)"""
    },

    "while_loop": {
        "title": "While Loop",
        "description": "Repeats a block of code as long as a condition is true.",
        "syntax": "while condition:",
        "example": """count = 0
while count < 5:
    print(count)
    count += 1"""
    },

    "if_elif_else": {
        "title": "If / Elif / Else",
        "description": "Used for decision making based on conditions.",
        "syntax": """if condition:
elif another_condition:
else:""",
        "example": """x = 10
if x > 10:
    print("Greater than 10")
elif x == 10:
    print("Equal to 10")
else:
    print("Less than 10")"""
    },

    "function": {
        "title": "Function",
        "description": "A reusable block of code that performs a specific task.",
        "syntax": "def function_name(parameters):",
        "example": """def greet(name):
    print("Hello", name)

greet("Alice")"""
    },

    "list": {
        "title": "List",
        "description": "An ordered, mutable collection of items.",
        "syntax": "list_name = [item1, item2, item3]",
        "example": """numbers = [1, 2, 3, 4]
print(numbers[0])"""
    },

    "dictionary": {
        "title": "Dictionary",
        "description": "Stores data in key-value pairs.",
        "syntax": "dict_name = {key: value}",
        "example": """student = {"name": "John", "age": 20}
print(student["name"])"""
    },

    "input_output": {
        "title": "Input and Output",
        "description": "Used to take input from the user and display output.",
        "syntax": "input() / print()",
        "example": """name = input("Enter your name: ")
print("Hello", name)"""
    }
}
