import React, { Component } from 'react';
import PostTags from './PostTags.jsx';

const PostCard = (props) => {
  let {title, postUrl, imageUrl, videoUrl, tags} = props;
  return (
      <div className="postDiv">
        <a className="postTitle" href={postUrl}>{title}</a>
        {imageUrl &&
          <img href={imageUrl}/>
        }
        <PostTags tags={tags}/>
      </div>

    );
};

export default PostCard;