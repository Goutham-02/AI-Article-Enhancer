import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { getArticles } from "./api";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Dialog,
  DialogContent,
  IconButton,
  Link,
  useMediaQuery,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Tabs,
  Tab
} from "@mui/material";
import {
  Close as CloseIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  OpenInNew as OpenInNewIcon,
  CompareArrows as CompareIcon
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    h1: {
      fontWeight: 800,
      fontSize: "3rem",
      background: "linear-gradient(135deg, #0f172a 0%, #475569 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      letterSpacing: "-0.02em",
    },
    h2: {
      fontWeight: 700,
      fontSize: "1.25rem",
      lineHeight: 1.4,
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.7,
      color: "#334155",
    },
  },
  palette: {
    primary: { main: "#1e1e1e" },
    secondary: { main: "#6366f1" },
    background: { default: "#f8fafc", paper: "#ffffff" },
    text: { primary: "#0f172a", secondary: "#475569" },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: "1px solid #e2e8f0",
          boxShadow: "none",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-5px)",
            boxShadow: "0 20px 40px -5px rgba(0, 0, 0, 0.05)",
            borderColor: "#6366f1",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 100,
        },
      },
    },
  },
});

function App() {
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [originalArticle, setOriginalArticle] = useState(null);
  const [viewMode, setViewMode] = useState("enhanced");
  const [loading, setLoading] = useState(true);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    getArticles()
      .then(data => {
        setArticles(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (selectedArticle && selectedArticle.is_generated && selectedArticle.original_article_id) {
      const foundOriginal = articles.find(a => a.id === selectedArticle.original_article_id);
      setOriginalArticle(foundOriginal || null);
      setViewMode("enhanced");
    } else {
      setOriginalArticle(null);
      setViewMode("enhanced");
    }
  }, [selectedArticle, articles]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography variant="h5" color="text.secondary">Loading articles...</Typography>
      </Box>
    );
  }

  const currentViewArticle = viewMode === "original" && originalArticle ? originalArticle : selectedArticle;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 5 }}>

        <Box textAlign="center" mb={6}>
          <Typography variant="h1">Article Feed</Typography>
          <Typography variant="subtitle1" color="text.secondary" mt={2}>
            Articles
          </Typography>
        </Box>

        {/* Grid */}
        <Grid container spacing={4}>
          {articles.map((article) => (
            <Grid item xs={12} sm={6} md={4} key={article.id}>
              <Card
                onClick={() => setSelectedArticle(article)}
                sx={{ height: "100%", display: "flex", flexDirection: "column", cursor: "pointer", position: 'relative' }}
              >
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Chip
                      label={article.is_generated ? "AI Enhanced" : "Original"}
                      size="small"
                      sx={{
                        bgcolor: article.is_generated ? alpha(theme.palette.secondary.main, 0.1) : "#f1f5f9",
                        color: article.is_generated ? "secondary.main" : "#64748b"
                      }}
                    />
                  </Box>

                  <Typography variant="h2" gutterBottom>
                    {article.title}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{
                    mb: 2,
                    flexGrow: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {article.content.replace(/[#*`]/g, '').slice(0, 150)}...
                  </Typography>

                  <Box display="flex" justifyContent="space-between" alignItems="center" pt={2} borderTop="1px solid #e2e8f0" mt="auto">
                    <Typography variant="caption" fontWeight={500} color="text.secondary">
                      {formatDate(article.created_at)}
                    </Typography>
                    {article.is_generated && <PersonIcon sx={{ fontSize: 18, color: "text.secondary" }} />}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Dialog
          open={!!selectedArticle}
          onClose={() => setSelectedArticle(null)}
          maxWidth="lg"
          fullWidth
          fullScreen={isMobile}
          PaperProps={{
            sx: { borderRadius: isMobile ? 0 : 3, p: isMobile ? 2 : 4 }
          }}
        >
          {selectedArticle && (
            <DialogContent>
              <IconButton
                onClick={() => setSelectedArticle(null)}
                sx={{
                  position: 'absolute',
                  right: 20,
                  top: 20,
                  bgcolor: 'background.paper',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  '&:hover': { bgcolor: '#f1f5f9' },
                  zIndex: 10
                }}
              >
                <CloseIcon />
              </IconButton>

              <Box textAlign="center" mb={4} mt={2}>
                {originalArticle && (
                  <Box display="flex" justifyContent="center" mb={3}>
                    <Tabs
                      value={viewMode}
                      onChange={(e, v) => setViewMode(v)}
                      textColor="secondary"
                      indicatorColor="secondary"
                      sx={{ bgcolor: "#f8fafc", borderRadius: 2, p: 0.5 }}
                    >
                      <Tab
                        value="enhanced"
                        label="AI Enhanced"
                        sx={{ textTransform: 'none', fontWeight: 600, minHeight: 40 }}
                      />
                      <Tab
                        value="original"
                        label="Original Source"
                        sx={{ textTransform: 'none', fontWeight: 600, minHeight: 40 }}
                      />
                    </Tabs>
                  </Box>
                )}

                <Chip
                  label={currentViewArticle.is_generated ? "AI Enhanced" : "Original Source"}
                  sx={{
                    mb: 2,
                    fontWeight: 600,
                    bgcolor: currentViewArticle.is_generated ? alpha(theme.palette.secondary.main, 0.1) : "#f1f5f9",
                    color: currentViewArticle.is_generated ? "secondary.main" : "#64748b"
                  }}
                />
                <Typography variant="h3" fontWeight={800} gutterBottom sx={{
                  background: "linear-gradient(135deg, #0f172a 0%, #333 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontSize: { xs: "1.75rem", md: "2.5rem" }
                }}>
                  {currentViewArticle.title}
                </Typography>

                <Box display="flex" justifyContent="center" gap={3} color="text.secondary" fontSize="0.9rem">
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <CalendarIcon fontSize="small" /> {formatDate(currentViewArticle.created_at)}
                  </Box>
                  {currentViewArticle.source_url && currentViewArticle.source_url !== "N/A" && (
                    <Link
                      href={currentViewArticle.source_url}
                      target="_blank"
                      underline="hover"
                      sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "secondary.main", fontWeight: 500 }}
                    >
                      View Link <OpenInNewIcon fontSize="small" />
                    </Link>
                  )}
                </Box>
              </Box>

              <Box sx={{
                typography: 'body1',
                '& h2': { fontSize: '1.8rem', mt: 4, mb: 2, fontWeight: 700, color: 'text.primary' },
                '& h3': { fontSize: '1.4rem', mt: 3, mb: 1.5, fontWeight: 600 },
                '& a': { color: 'secondary.main', textDecoration: 'none', borderBottom: '1px solid transparent', transition: '0.2s' },
                '& a:hover': { borderBottomColor: 'currentColor' },
                '& ul, & ol': { pl: 3, mb: 2 },
                '& li': { mb: 1 }
              }}>
                <ReactMarkdown>{currentViewArticle.content}</ReactMarkdown>
              </Box>

            </DialogContent>
          )}
        </Dialog>

      </Container>
    </ThemeProvider>
  );
}

export default App;
