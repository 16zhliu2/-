from pygments import highlight
from pygments.formatters.html import HtmlFormatter
from pygments.lexers import get_lexer_by_name


class codeStyle():
    def __init__(self, style='native'):
        self.style = style
        self.formatter = HtmlFormatter(style=style)

    def get_css(self):
        css = self.formatter.get_style_defs('.highlight')
        return css

    def translate_code(self, code, language):
        lexer = get_lexer_by_name(language)
        html = highlight(code, lexer, self.formatter)
        return html
