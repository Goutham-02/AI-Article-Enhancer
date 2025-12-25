<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Illuminate\Http\Request;

class ArticleController extends Controller
{
    // List all articles
    public function index()
    {
        return Article::orderBy('created_at', 'desc')->get();
    }

    // Show single article
    public function show($id)
    {
        return Article::findOrFail($id);
    }

    // Create article
    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string',
            'content' => 'required|string',
            'source_url' => 'nullable|string',
            'is_generated' => 'boolean',
            'references' => 'nullable|array',
            'original_article_id' => 'nullable|exists:articles,id'
        ]);

        return Article::create($data);
    }

    // Update article
    public function update(Request $request, $id)
    {
        $article = Article::findOrFail($id);

        $data = $request->validate([
            'title' => 'sometimes|string',
            'content' => 'sometimes|string',
            'source_url' => 'nullable|string',
            'is_generated' => 'boolean',
            'references' => 'nullable|array'
        ]);

        $article->update($data);

        return $article;
    }

    // Delete article (optional)
    public function destroy($id)
    {
        $article = Article::findOrFail($id);
        $article->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
