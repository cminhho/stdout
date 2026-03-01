# Button Placement Audit (pre-consolidation)

## Tools with session/share (persistToolId + shareState)

- JsonFormatterPage
- Base64Page
- JwtDecodePage

## Tools using TwoPanelToolLayout with output download (outputFilename)

Formatters: JsonFormatterPage, XmlFormatterPage, JsFormatterPage, HtmlFormatterPage, CssFormatterPage, SqlFormatterPage  
Converters: JsonTypescriptPage, CsvXmlPage, XmlJsonPage, JsonYamlPage, JsonQueryStringPage, EnvNetlifyPage, CsvJsonPage, XsdGeneratorPage  
Encode: Base64Page, JwtDecodePage, UrlEncodePage, HtmlEntityPage, GzipPage, CertificatePage  
Other: AsciiArtPage

## Tool classification

1. **Two-pane with session/share**: JsonFormatterPage, Base64Page, JwtDecodePage (pilot tools).
2. **Two-pane without session/share**: All other pages using TwoPanelToolLayout (see list above).
3. **Single-pane or custom**: CssInlinerPage, ImageResizerPage, SvgViewerPage, LogGeneratorPage (use SaveButton or custom toolbar directly).

## UI language

Existing components (SaveSessionButton, ShareSnippetButton, SavedSessionsPopover) use English. Plan: keep English for new/changed labels for consistency unless product requests Vietnamese.
