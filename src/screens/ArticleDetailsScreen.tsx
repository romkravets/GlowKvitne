import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import axios from 'axios';
import { API_CONFIG } from '../config/firebase';
import { Markdown } from 'react-native-markdown-display';

interface Article {
  _id: string;
  title: string;
  slug: string;
  content: string;
  coverImage?: string;
  category: string;
  tags: string[];
  author: {
    name: string;
    avatar?: string;
    bio?: string;
  };
  stats: {
    likes: number;
    views: number;
    shares: number;
  };
  publishedAt: string;
  readTime?: number;
}

type ExploreStackParamList = {
  Articles: undefined;
  ArticleDetails: { articleId: string; slug: string };
};

type ArticleDetailsScreenProps = {
  navigation: NativeStackNavigationProp<
    ExploreStackParamList,
    'ArticleDetails'
  >;
  route: RouteProp<ExploreStackParamList, 'ArticleDetails'>;
};

const ArticleDetailsScreen = ({
  navigation,
  route,
}: ArticleDetailsScreenProps) => {
  const { slug } = route.params;
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    fetchArticleDetails();
  }, [slug]);

  const fetchArticleDetails = async () => {
    try {
      const response = await axios.get(
        `${API_CONFIG.baseURL}/api/public/articles/${slug}`,
      );
      setArticle(response.data.article);
      setLikesCount(response.data.article.stats.likes);
    } catch (error) {
      console.error('Error fetching article:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити статтю');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!article) return;

    try {
      await axios.post(
        `${API_CONFIG.baseURL}/api/public/articles/${article._id}/like`,
      );
      setLikesCount(prev => (liked ? prev - 1 : prev + 1));
      setLiked(!liked);
    } catch (error) {
      console.error('Error liking article:', error);
    }
  };

  const handleShare = async () => {
    if (!article) return;

    try {
      await Share.share({
        message: `${article.title}\n\nПрочитай цю статтю в GlowKvitne!`,
        url: `https://glowkvitne.com/articles/${article.slug}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#C49B63" />
      </View>
    );
  }

  if (!article) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover Image */}
        <Image
          source={{
            uri: article.coverImage || 'https://via.placeholder.com/400',
          }}
          style={styles.coverImage}
        />

        <View style={styles.contentContainer}>
          {/* Category Badge */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{article.category}</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{article.title}</Text>

          {/* Meta Info */}
          <View style={styles.metaContainer}>
            <View style={styles.authorInfo}>
              <View style={styles.authorAvatar}>
                <Text style={styles.authorAvatarText}>
                  {article.author.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={styles.authorName}>{article.author.name}</Text>
                <Text style={styles.publishedDate}>
                  {formatDate(article.publishedAt)} · {article.readTime} хв
                  читання
                </Text>
              </View>
            </View>

            <View style={styles.stats}>
              <Text style={styles.viewsCount}>👁 {article.stats.views}</Text>
            </View>
          </View>

          {/* Content */}
          <Markdown style={styles.content}>{article.content}</Markdown>
          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {article.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Author Bio */}
          {article.author.bio && (
            <View style={styles.authorBioContainer}>
              <Text style={styles.authorBioTitle}>Про автора</Text>
              <View style={styles.authorBioContent}>
                <View style={styles.authorBioAvatar}>
                  <Text style={styles.authorBioAvatarText}>
                    {article.author.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.authorBioText}>
                  <Text style={styles.authorBioName}>
                    {article.author.name}
                  </Text>
                  <Text style={styles.authorBio}>{article.author.bio}</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Actions Bar */}
      <View style={styles.actionsBar}>
        <TouchableOpacity
          style={[styles.likeButton, liked && styles.likeButtonActive]}
          onPress={handleLike}
        >
          <Text style={styles.likeIcon}>{liked ? '❤️' : '🤍'}</Text>
          <Text style={styles.likeCount}>{likesCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareIcon}>📤</Text>
          <Text style={styles.shareText}>Поділитися</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  coverImage: {
    width: '100%',
    height: 280,
    backgroundColor: '#E5E5E5',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#C49B63',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  categoryText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    lineHeight: 36,
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#C49B63',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  authorAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  authorName: {
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  publishedDate: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  stats: {
    alignItems: 'flex-end',
  },
  viewsCount: {
    fontSize: 14,
    color: '#666',
  },
  content: {
    fontSize: 16,
    color: '#1A1A1A',
    lineHeight: 26,
    marginBottom: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  tag: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 13,
    color: '#666',
  },
  authorBioContainer: {
    backgroundColor: '#F9F9F9',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  authorBioTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  authorBioContent: {
    flexDirection: 'row',
  },
  authorBioAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#C49B63',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  authorBioAvatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
  authorBioText: {
    flex: 1,
  },
  authorBioName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  authorBio: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actionsBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    marginRight: 12,
  },
  likeButtonActive: {
    backgroundColor: '#FFE8E8',
  },
  likeIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  likeCount: {
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C49B63',
    paddingVertical: 10,
    borderRadius: 24,
  },
  shareIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  shareText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
  },
});

export default ArticleDetailsScreen;
