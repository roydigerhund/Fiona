<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
<meta http-equiv="Content-Type" content="<?php bloginfo('html_type'); ?>; charset=<?php bloginfo('charset'); ?>" />
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no"/>
<meta name="apple-mobile-web-app-capable" content="yes" />


<title><?php wp_title(); ?></title>
<?php wp_head(); ?>
<?php get_template_part('parts/getFonts'); ?>
<link rel="stylesheet" href="<?php bloginfo('template_directory'); ?>/css/style.css" type="text/css" media="screen">
<link rel="pingback" href="<?php bloginfo('pingback_url'); ?>" />
</head>


<body>
